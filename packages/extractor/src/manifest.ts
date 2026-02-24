import * as fs from "fs/promises";
import * as path from "path";
import sizeOf from "image-size";
import type { Manifest, ManifestItem } from "@komarubrowser/common/types";
import { OUTPUT_BASE, MANIFEST_OUTPUT, pathExists } from "./shared.js";

async function getPngInfo(
  filePath: string,
  jarName: string,
  modId: string,
  itemType: string,
  filename: string,
): Promise<ManifestItem | null> {
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
    console.log(`Warning: Failed to parse ${filePath} - ${err}`);
    return null;
  }
}

export async function buildManifest(): Promise<void> {
  console.log(`Building manifest for ${OUTPUT_BASE}...`);

  const extractedDir = OUTPUT_BASE;

  if (!(await pathExists(extractedDir))) {
    console.error(`Error: Directory ${extractedDir} does not exist.`);
    process.exit(1);
  }

  const jarDirs = await fs.readdir(extractedDir, { withFileTypes: true });
  const tasks: Promise<ManifestItem | null>[] = [];

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
          tasks.push(getPngInfo(filePath, jar.name, mod.name, itemType.name, file));
        }
      }
    }
  }

  console.log(`Queued ${tasks.length} images for processing. Reading headers...`);

  const results = await Promise.all(tasks);
  const manifest: Manifest = results.filter((r): r is ManifestItem => r !== null);

  await fs.mkdir(path.dirname(MANIFEST_OUTPUT), { recursive: true });
  await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2));

  console.log(`Manifest successfully generated at ${MANIFEST_OUTPUT}`);
}
