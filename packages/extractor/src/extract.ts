import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import type { Ingredient } from "@komarubrowser/common/types";
import * as utils from "./utils.js";

// const { MODS_DIR, INGREDIENTS_FILE, JAR_OUTPUT_DIR } = getJarEnv();

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

  const tmpDir = await utils.makeTmpDir(`extract/${jar}_tree`);
  try {
    const zip = new AdmZip(jarPath);
    const entries = zip.getEntries();

    const pngEntries = entries.filter(
      ({ entryName }) =>
        entryName.startsWith("assets/") &&
        (entryName.includes("/textures/item/") || entryName.includes("/textures/block/")) &&
        entryName.endsWith(".png"),
    );

    for (const entry of pngEntries) {
      zip.extractEntryTo(entry, tmpDir, true, true);
    }

    const assetsPath = path.join(tmpDir, "assets");
    if (!(await utils.pathExists(assetsPath))) {
      return false;
    }
    // Pattern: Look inside any namespace, then textures, then item/block, for any .png
    // The 'cwd' option allows us to use relative paths for easier mapping
    const pngFiles = fs.glob("/{item,block}/**/*.png", { cwd: assetsPath });

    for await (const relativePath of pngFiles) {
      // relativePath will look like: "minecraft/textures/item/apple.png"
      const parts = relativePath.split(path.sep);
      const namespace = parts[0];
      const type = parts[2]; // 'item' or 'block' based on our glob
      const fileName = parts[parts.length - 1];

      const srcPath = path.join(assetsPath, relativePath);
      const destDir = path.join(tmpDir, namespace, type);
      const destPath = path.join(destDir, fileName);

      await fs.mkdir(destDir, { recursive: true });
      await fs.copyFile(srcPath, destPath);
    }

    await utils.copyDir(path.join(tmpDir, "assets"), path.join(outputDir, "assets"));

    if (await utils.pathExists(tmpDir)) {
      await fs.rm(tmpDir, { recursive: true });
    }

    return true;
  } catch (err) {
    console.error(`\nError processing ${jar}: ${err}\n`);
    return false;
  } finally {
    if (await utils.pathExists(tmpDir)) {
      await fs.rm(tmpDir, { recursive: true });
    }
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
      await fs.rm(JAR_OUTPUT_DIR, { recursive: true });
    }
    await fs.mkdir(path.dirname(JAR_OUTPUT_DIR), { recursive: true });
    await utils.atomicMove(stagingBase, JAR_OUTPUT_DIR);

    console.log("====================");
    console.log(`Extraction complete. Assets stored in ${JAR_OUTPUT_DIR}`);
  } catch (err) {
    console.error("Extraction failed, cleaning up staging area...");
    await fs.rm(stagingBase, { recursive: true, force: true });
    throw err;
  }
}
