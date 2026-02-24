import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";

const REQUIRED_ENV = ["star_t_dir", "raw_assets_dir", "assets_dir"] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const MODS_DIR = path.join(process.env.star_t_dir!, "mods");
const INGREDIENTS_FILE = path.join(
  process.env.raw_assets_dir!,
  "dump",
  "ingredients.json",
);
const OUTPUT_BASE = path.join(process.env.assets_dir!, "extracted");

const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
  "server-1.20.1-20230612.114412-srg.jar": "1.20.1.jar",
};

type Ingredient = {
  sourceJar?: string;
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function extractJar(jar: string): Promise<boolean> {
  const extractName = JAR_MAPPINGS[jar] || jar;
  const jarPath = path.join(MODS_DIR, extractName);
  const tempDir = path.join(OUTPUT_BASE, `temp_${jar}`);
  const finalDir = path.join(OUTPUT_BASE, jar);

  if (!(await pathExists(jarPath))) {
    console.log(`Warning: JAR not found: ${jar}`);
    return false;
  }

  console.log(`Processing: ${jar}`);

  try {
    if (await pathExists(tempDir)) await fs.rm(tempDir, { recursive: true });
    if (await pathExists(finalDir)) await fs.rm(finalDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });

    const zip = new AdmZip(jarPath);
    const entries = zip.getEntries();

    const pngEntries = entries.filter((entry) => {
      const entryName = entry.entryName;
      return (
        entryName.startsWith("assets/") &&
        (entryName.includes("/textures/item/") ||
          entryName.includes("/textures/block/")) &&
        entryName.endsWith(".png")
      );
    });

    console.log(`  unzipping: ${jarPath}`);
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
            const destDir = path.join(finalDir, namespace, type);
            await fs.mkdir(destDir, { recursive: true });

            console.log(`  moving: ${typePath}`);
            const pngFiles = await getAllPngFiles(typePath);
            await Promise.all(
              pngFiles.map(async (pngFile) => {
                const destPath = path.join(destDir, path.basename(pngFile));
                await fs.copyFile(pngFile, destPath);
              })
            );
          }
        }
      }
    }

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

async function extractAssets(): Promise<void> {
  if (!(await pathExists(INGREDIENTS_FILE))) {
    console.error(`Error: Ingredients file not found: ${INGREDIENTS_FILE}`);
    process.exit(1);
  }

  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);
  const uniqueJars = [
    ...new Set(ingredients.map((i) => i.sourceJar).filter(Boolean)),
  ] as string[];

  console.log(`Reading JAR list from ${INGREDIENTS_FILE}...`);

  await fs.mkdir(OUTPUT_BASE, { recursive: true });

  const results = await Promise.all(uniqueJars.map((jar) => extractJar(jar!)));
  const successCount = results.filter(Boolean).length;

  console.log("====================");
  console.log(`Extraction complete. Assets stored in ${OUTPUT_BASE}`);
}

await extractAssets();
