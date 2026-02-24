import * as fs from "fs/promises";
import * as path from "path";
import sizeOf from "image-size";
import cliProgress from "cli-progress";
import type { ManifestRow } from "@komarubrowser/common/tables";
import { OUTPUT_BASE, pathExists } from "./shared.js";

async function getPngInfo(
  filePath: string,
  jarName: string,
  modId: string,
  itemType: string,
  filename: string,
): Promise<ManifestRow | null> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const dimensions = sizeOf(fileBuffer);
    return {
      jar: jarName,
      mod: modId,
      type: itemType,
      filename,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
    };
  } catch (err) {
    return null;
  }
}

export async function buildManifestItems(): Promise<ManifestRow[]> {
  console.log(`Building manifest for ${OUTPUT_BASE}...`);

  const extractedDir = OUTPUT_BASE;

  if (!(await pathExists(extractedDir))) {
    console.error(`Error: Directory ${extractedDir} does not exist.`);
    process.exit(1);
  }

  const jarDirs = await fs.readdir(extractedDir, { withFileTypes: true });
  const tasks: { task: Promise<ManifestRow | null>; info: string }[] = [];

  for (const jar of jarDirs) {
    if (!jar.isDirectory()) continue;
    const jarPath = path.join(extractedDir, jar.name);

    const modDirs = await fs.readdir(jarPath, { withFileTypes: true });
    for (const mod of modDirs) {
      if (!mod.isDirectory()) continue;
      const modPath = path.join(jarPath, mod.name);

      const typeDirs = await fs.readdir(modPath, { withFileTypes: true });
      for (const itemType of typeDirs) {
        if (!itemType.isDirectory()) continue;
        const typePath = path.join(modPath, itemType.name);

        const files = await fs.readdir(typePath);
        for (const file of files) {
          if (!file.endsWith(".png")) continue;
          const filePath = path.join(typePath, file);
          tasks.push({
            task: getPngInfo(filePath, jar.name, mod.name, itemType.name, file),
            info: file,
          });
        }
      }
    }
  }

  console.log(`Processing ${tasks.length} images...`);

  const progressBar = new cliProgress.SingleBar({
    format: "  {bar} {percentage}% | {value}/{total}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressBar.start(tasks.length, 0);

  const results: ManifestRow[] = [];
  for (const { task } of tasks) {
    const result = await task;
    if (result) results.push(result);
    progressBar.increment();
  }

  progressBar.stop();

  return results;
}
