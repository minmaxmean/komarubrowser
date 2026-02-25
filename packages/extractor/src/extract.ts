import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import type { Ingredient } from "@komarubrowser/common/types";
import * as utils from "./utils.js";

const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
  "server-1.20.1-20230612.114412-srg.jar": "1.20.1.jar",
};

async function extractJar(jar: string, outputDir: string, MODS_DIR: string): Promise<boolean> {
  const extractName = JAR_MAPPINGS[jar] || jar;
  const jarPath = path.join(MODS_DIR, extractName);

  if (!(await utils.pathExists(jarPath))) {
    console.warn(`\nWarning: JAR not found: ${jar}\n`);
    return false;
  }

  const jarTmpDir = await utils.makeTmpDir(`extract_tree/${jar}`);
  try {
    const zip = new AdmZip(jarPath);
    const entries = zip.getEntries();

    const pngEntries = entries.filter(({ entryName }) => entryName.startsWith("assets/") && entryName.endsWith(".png"));

    if (pngEntries.length === 0) {
      console.warn(`  jar ${jar} doesn't have any assets`);
    }

    for (const entry of pngEntries) {
      zip.extractEntryTo(entry, jarTmpDir, true, true);
    }

    await utils.copyDir(path.join(jarTmpDir, "assets"), path.join(outputDir, "assets"));
    return true;
  } catch (err) {
    console.error(`\nError processing ${jar}: ${err}\n`);
    return false;
  } finally {
    await utils.rmrf(jarTmpDir);
  }
}

export type ExtractAssetsArgs = {
  INGREDIENTS_FILE: string;
  MODS_DIR: string;
  JAR_OUTPUT_DIR: string;
};

export async function extractPngs({ INGREDIENTS_FILE, JAR_OUTPUT_DIR, MODS_DIR }: ExtractAssetsArgs): Promise<void> {
  if (!(await utils.pathExists(INGREDIENTS_FILE))) {
    console.error(`Error: Ingredients file not found: ${INGREDIENTS_FILE}`);
    process.exit(1);
  }

  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);
  const uniqueJars = [...new Set(ingredients.map((i) => i.sourceJar).filter(Boolean))] as string[];

  console.log(`Reading JAR list from ${INGREDIENTS_FILE}...`);

  const stagingBase = await utils.makeTmpDir("extract-pngs");

  try {
    console.log(`Processing ${uniqueJars.length} JARs into staging area...`);

    const progressBar = new cliProgress.SingleBar({
      format: "  {bar} {percentage}% | {value}/{total} | {jar}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(uniqueJars.length, 0, { jar: "last_jar" });

    await Promise.all(
      uniqueJars.map(async (jar) => {
        await extractJar(jar!, stagingBase, MODS_DIR);
        progressBar.increment({ jar });
      }),
    );

    progressBar.stop();

    console.log(`Committing assets to ${JAR_OUTPUT_DIR}...`);
    if (await utils.pathExists(JAR_OUTPUT_DIR)) {
      await utils.rmrf(JAR_OUTPUT_DIR);
    }
    await utils.mkdirp(path.dirname(JAR_OUTPUT_DIR));
    await utils.atomicMove(stagingBase, JAR_OUTPUT_DIR);

    console.log("====================");
    console.log(`Extraction complete. Assets stored in ${JAR_OUTPUT_DIR}`);
  } catch (err) {
    console.error("Extraction failed, cleaning up staging area...");
    await utils.rmrf(stagingBase);
    throw err;
  }
}
