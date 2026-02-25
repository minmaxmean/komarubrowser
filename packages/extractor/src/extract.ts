import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import { pathExists, copyDir, atomicMove, getJarEnv } from "./shared.js";
import type { Ingredient } from "@komarubrowser/common/types";

const { MODS_DIR, INGREDIENTS_FILE, JAR_OUTPUT_DIR } = getJarEnv();

const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
  "server-1.20.1-20230612.114412-srg.jar": "1.20.1.jar",
};

async function extractJar(jar: string, stagingBase: string): Promise<boolean> {
  const extractName = JAR_MAPPINGS[jar] || jar;
  const jarPath = path.join(MODS_DIR, extractName);
  const tempDir = await fs.mkdtemp(path.join(stagingBase, "non_flat"));
  const finalDirInStaging = path.join(stagingBase, jar);

  if (!(await pathExists(jarPath))) {
    console.warn(`\nWarning: JAR not found: ${jar}\n`);
    return false;
  }

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const zip = new AdmZip(jarPath);
    const entries = zip.getEntries();

    const pngEntries = entries.filter((entry) => {
      const entryName = entry.entryName;
      return (
        entryName.startsWith("assets/") &&
        (entryName.includes("/textures/item/") || entryName.includes("/textures/block/")) &&
        entryName.endsWith(".png")
      );
    });

    for (const entry of pngEntries) {
      zip.extractEntryTo(entry, tempDir, true, true);
    }

    const assetsPath = path.join(tempDir, "assets");
    if (await pathExists(assetsPath)) {
      // const namespaces = await fs.readdir(assetsPath);
      //
      // for (const namespace of namespaces) {
      //   const nsPath = path.join(assetsPath, namespace);
      //   const stat = await fs.stat(nsPath);
      //   if (!stat.isDirectory()) continue;
      //
      //   for (const type of ["item", "block"]) {
      //     const typePath = path.join(nsPath, "textures", type);
      //     if (await pathExists(typePath)) {
      //       const destDir = path.join(tempDir, namespace, type);
      //       await fs.mkdir(destDir, { recursive: true });
      //
      //       const pngFiles = await getAllPngFiles(typePath);
      //       await Promise.all(
      //         pngFiles.map(async (pngFile) => {
      //           const destPath = path.join(destDir, path.basename(pngFile));
      //           await fs.copyFile(pngFile, destPath);
      //         }),
      //       );
      //     }
      //   }
      // }
    }

    await fs.mkdir(finalDirInStaging, { recursive: true });
    await copyDir(path.join(tempDir, "assets"), path.join(finalDirInStaging, "assets"));

    if (await pathExists(tempDir)) {
      await fs.rm(tempDir, { recursive: true });
    }

    return true;
  } catch (err) {
    console.error(`\nError processing ${jar}: ${err}\n`);
    if (await pathExists(tempDir)) {
      await fs.rm(tempDir, { recursive: true });
    }
    return false;
  }
}

async function getAllPngFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  if (!(await pathExists(dir))) return files;

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllPngFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function extractAssets(): Promise<void> {
  if (!(await pathExists(INGREDIENTS_FILE))) {
    console.error(`Error: Ingredients file not found: ${INGREDIENTS_FILE}`);
    process.exit(1);
  }

  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);
  const uniqueJars = [...new Set(ingredients.map((i) => i.sourceJar).filter(Boolean))] as string[];

  console.log(`Reading JAR list from ${INGREDIENTS_FILE}...`);

  const stagingBase = await fs.mkdtemp(path.join(os.tmpdir(), "komaru", "extract"));

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
        await extractJar(jar!, stagingBase);
        progressBar.increment({ jar });
      }),
    );

    progressBar.stop();

    console.log(`Committing assets to ${JAR_OUTPUT_DIR}...`);
    if (await pathExists(JAR_OUTPUT_DIR)) {
      await fs.rm(JAR_OUTPUT_DIR, { recursive: true });
    }
    await fs.mkdir(path.dirname(JAR_OUTPUT_DIR), { recursive: true });
    await atomicMove(stagingBase, JAR_OUTPUT_DIR);

    console.log("====================");
    console.log(`Extraction complete. Assets stored in ${JAR_OUTPUT_DIR}`);
  } catch (err) {
    console.error("Extraction failed, cleaning up staging area...");
    await fs.rm(stagingBase, { recursive: true, force: true });
    throw err;
  }
}
