import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import {
  MODS_DIR,
  INGREDIENTS_FILE,
  OUTPUT_BASE,
  JAR_MAPPINGS,
  pathExists,
  copyDir,
  atomicMove,
} from "./shared.js";
import type { Ingredient } from '@komarubrowser/common/types';

async function extractJar(jar: string, stagingBase: string): Promise<boolean> {
  const extractName = JAR_MAPPINGS[jar] || jar;
  const jarPath = path.join(MODS_DIR, extractName);
  const tempDir = path.join(os.tmpdir(), `komaru_${jar}_${Math.random().toString(36).slice(2)}`);
  const finalDirInStaging = path.join(stagingBase, jar);

  if (!(await pathExists(jarPath))) {
    console.log(`Warning: JAR not found: ${jar}`);
    return false;
  }

  try {
    if (await pathExists(tempDir)) {
      await fs.rm(tempDir, { recursive: true });
    }
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
      const namespaces = await fs.readdir(assetsPath);

      for (const namespace of namespaces) {
        const nsPath = path.join(assetsPath, namespace);
        const stat = await fs.stat(nsPath);
        if (!stat.isDirectory()) continue;

        for (const type of ["item", "block"]) {
          const typePath = path.join(nsPath, "textures", type);
          if (await pathExists(typePath)) {
            const destDir = path.join(tempDir, namespace, type);
            await fs.mkdir(destDir, { recursive: true });

            const pngFiles = await getAllPngFiles(typePath);
            await Promise.all(
              pngFiles.map(async (pngFile) => {
                const destPath = path.join(destDir, path.basename(pngFile));
                await fs.copyFile(pngFile, destPath);
              }),
            );
          }
        }
      }
    }

    await fs.mkdir(finalDirInStaging, { recursive: true });
    await copyDir(path.join(tempDir, "assets"), path.join(finalDirInStaging, "assets"));

    if (await pathExists(tempDir)) {
      await fs.rm(tempDir, { recursive: true });
    }

    return true;
  } catch (err) {
    console.error(`  Error processing ${jar}: ${err}`);
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

  const stagingBase = await fs.mkdtemp(path.join(os.tmpdir(), "komaru-extract-"));

  try {
    console.log(`Processing ${uniqueJars.length} JARs into staging area...`);

    const progressBar = new cliProgress.SingleBar({
      format: "  {bar} {percentage}% | {value}/{total} | {jar}",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(uniqueJars.length, 0);

    let completed = 0;
    await Promise.all(
      uniqueJars.map(async (jar) => {
        progressBar.update(completed, { jar });
        await extractJar(jar!, stagingBase);
        completed++;
        progressBar.update(completed);
      }),
    );

    progressBar.stop();

    console.log(`Committing assets to ${OUTPUT_BASE}...`);
    if (await pathExists(OUTPUT_BASE)) {
      await fs.rm(OUTPUT_BASE, { recursive: true });
    }
    await fs.mkdir(path.dirname(OUTPUT_BASE), { recursive: true });
    await atomicMove(stagingBase, OUTPUT_BASE);

    console.log("====================");
    console.log(`Extraction complete. Assets stored in ${OUTPUT_BASE}`);
  } catch (err) {
    console.error("Extraction failed, cleaning up staging area...");
    await fs.rm(stagingBase, { recursive: true, force: true });
    throw err;
  }
}
