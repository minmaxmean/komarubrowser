import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import * as utils from "./utils.js";
import { ExtractPngArgs } from "./args.js";
import { IngredientJson } from "@komarubrowser/common/tables";

const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
};

const SKIPPED_JARS = new Set(["client-1.20.1-20230612.114412-srg.jar"]);

const ADDITIONAL_JARS: Record<string, string[]> = {
  "XyCraft World-0.6.22.jar": ["XyCraft Core-0.6.22.jar"],
  "thermal_core-1.20.1-11.0.6.24.jar": [
    "thermal_cultivation-1.20.1-11.0.1.24.jar",
    "thermal_expansion-1.20.1-11.0.1.29.jar",
    "thermal_foundation-1.20.1-11.0.6.70.jar",
  ],
};

async function extractJar(jar: string, outputDir: string, MODS_DIR: string): Promise<void> {
  if (ADDITIONAL_JARS[jar]) {
    console.log(`processing additional jar: ${ADDITIONAL_JARS[jar]}`);
    await Promise.all(ADDITIONAL_JARS[jar].map((subJar) => extractJar(subJar, outputDir, MODS_DIR)));
  }
  const extractName = JAR_MAPPINGS[jar] || jar;
  const jarPath = path.join(MODS_DIR, extractName);

  if (!(await utils.pathExists(jarPath))) {
    throw Error(`JAR not found: ${jar}`);
  }

  const jarTmpDir = await utils.makeTmpDir(`extract_tree/${jar}`);
  try {
    const zip = new AdmZip(jarPath);
    const entries = zip.getEntries();

    const pngEntries = entries.filter(({ entryName }) => entryName.startsWith("assets/") && entryName.endsWith(".png"));

    if (pngEntries.length === 0) {
      console.warn(`  jar ${jar} doesn't have any assets`);
      return;
    }

    for (const entry of pngEntries) {
      zip.extractEntryTo(entry, jarTmpDir, true, true);
    }

    await utils.copyDir(path.join(jarTmpDir, "assets"), path.join(outputDir, "assets"));
  } catch (err) {
    console.error(`\nError processing ${jar}: ${err}\n`);
    throw err;
  } finally {
    await utils.rmrf(jarTmpDir);
  }
}

async function copyKubeJSAssets(kubeAssetsDir: string, outptuDir: string): Promise<boolean> {
  if (!(await utils.pathExists(kubeAssetsDir))) {
    throw Error(`KubeJS assets not found: ${kubeAssetsDir}`);
  }
  const pngGlob = "**/*.png";
  const pngFiles = await Array.fromAsync(fs.glob(pngGlob, { cwd: kubeAssetsDir }));
  console.log(`Found ${pngFiles.length} KubeJS pngs in ${pngGlob} at ${kubeAssetsDir}`);
  await Promise.all(
    pngFiles.map(async (png) => {
      const srcPath = path.join(kubeAssetsDir, png);
      const destPath = path.join(outptuDir, "assets", png);
      await utils.safeCopy(srcPath, destPath);
    }),
  );
  return true;
}

export async function extractPngs({ INGREDIENTS_FILE, JAR_OUTPUT_DIR, SERVER_DIR }: ExtractPngArgs): Promise<void> {
  if (!(await utils.pathExists(INGREDIENTS_FILE))) {
    console.error(`Error: Ingredients file not found: ${INGREDIENTS_FILE}`);
    process.exit(1);
  }

  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: IngredientJson[] = JSON.parse(ingredientsRaw);
  const uniqueJars = new Set(
    ingredients
      .map((i) => i.sourceJar)
      .filter(Boolean)
      .filter((jar) => !SKIPPED_JARS.has(jar)),
  );

  console.log(`Reading JAR list from ${INGREDIENTS_FILE}...`);

  const stagingBase = await utils.makeTmpDir("extract-pngs");

  try {
    console.log(`Processing ${uniqueJars.size} JARs into staging area...`);

    const progressBar = new cliProgress.SingleBar({
      format: "  {bar} {percentage}% | {value}/{total} | {jar}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(uniqueJars.size, 0, { jar: "" });

    await Promise.all(
      [...uniqueJars].map(async (jar) => {
        await extractJar(jar!, stagingBase, path.join(SERVER_DIR, "mods"));
        progressBar.increment({ jar });
      }),
    );
    progressBar.stop();

    const KUBEJS_ASSETS_DIR = path.join(SERVER_DIR, "kubejs", "assets");
    await copyKubeJSAssets(KUBEJS_ASSETS_DIR, stagingBase);

    console.log(`Committing assets to ${JAR_OUTPUT_DIR}...`);
    await utils.rmrf(JAR_OUTPUT_DIR);
    await utils.mkdirp(JAR_OUTPUT_DIR);
    await utils.atomicMove(stagingBase, JAR_OUTPUT_DIR);

    console.log("====================");
    console.log(`Extraction complete. Assets stored in ${JAR_OUTPUT_DIR}`);
  } catch (err) {
    console.error("Extraction failed, cleaning up staging area...");
    await utils.rmrf(stagingBase);
    throw err;
  }
}
