import * as fs from "fs/promises";
import * as path from "path";
import AdmZip from "adm-zip";
import sizeOf from "image-size";

const REQUIRED_ENV = ["star_t_dir", "raw_assets_dir", "assets_dir"] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const MODS_DIR = path.join(process.env.star_t_dir!, "mods");
const INGREDIENTS_FILE = path.join(process.env.raw_assets_dir!, "dump", "ingredients.json");
const OUTPUT_BASE = path.join(process.env.assets_dir!, "extracted");
const MANIFEST_OUTPUT = path.join(process.env.raw_assets_dir!, "dump", "manifest.json");
const INPUT_PATH = path.join(process.env.raw_assets_dir!, "dump");
const OUTPUT_PATH = path.join(process.env.assets_dir!, "dump");

const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
  "server-1.20.1-20230612.114412-srg.jar": "1.20.1.jar",
};

type Ingredient = {
  sourceJar?: string;
};

type ManifestItem = {
  filename: string;
  width: number;
  height: number;
  jar: string;
  mod: string;
  type: string;
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
        (entryName.includes("/textures/item/") || entryName.includes("/textures/block/")) &&
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
              }),
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

async function getPngInfo(
  filePath: string,
  jarName: string,
  modId: string,
  itemType: string,
  filename: string,
): Promise<ManifestItem | null> {
  try {
    const dimensions = sizeOf(filePath);
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

async function extractAssets(): Promise<void> {
  if (!(await pathExists(INGREDIENTS_FILE))) {
    console.error(`Error: Ingredients file not found: ${INGREDIENTS_FILE}`);
    process.exit(1);
  }

  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);
  const uniqueJars = [...new Set(ingredients.map((i) => i.sourceJar).filter(Boolean))] as string[];

  console.log(`Reading JAR list from ${INGREDIENTS_FILE}...`);

  await fs.mkdir(OUTPUT_BASE, { recursive: true });

  await Promise.all(uniqueJars.map((jar) => extractJar(jar!)));

  console.log("====================");
  console.log(`Extraction complete. Assets stored in ${OUTPUT_BASE}`);
}

async function buildManifest(): Promise<void> {
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
  const manifest = results.filter((r): r is ManifestItem => r !== null);

  await fs.mkdir(path.dirname(MANIFEST_OUTPUT), { recursive: true });
  await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(manifest, null, 2));

  console.log(`Manifest successfully generated at ${MANIFEST_OUTPUT}`);
}

async function minifyJson(): Promise<void> {
  console.log(`Looking for JSON files in: ${INPUT_PATH}`);

  if (!(await pathExists(INPUT_PATH))) {
    console.error(`Error: Directory ${INPUT_PATH} does not exist.`);
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_PATH, { recursive: true });

  const files = await fs.readdir(INPUT_PATH);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log(`No JSON files found in ${INPUT_PATH}`);
    return;
  }

  for (const filename of jsonFiles) {
    const inputFile = path.join(INPUT_PATH, filename);
    const outputFile = path.join(OUTPUT_PATH, filename.replace(/\.json$/, ".min.json"));
    console.log(`Minifying ${filename}...`);
    const content = await fs.readFile(inputFile, "utf-8");
    const parsed = JSON.parse(content);
    const minified = JSON.stringify(parsed);
    await fs.writeFile(outputFile, minified);
    console.log(`  minified to ${outputFile}`);
  }

  console.log(`Successfully minified ${jsonFiles.length} files.`);
  console.log(`  Output folder: ${OUTPUT_PATH}`);
}

const args = process.argv.slice(2);
const isMinifyMode = args.includes("--minify");

async function main(): Promise<void> {
  if (isMinifyMode) {
    await minifyJson();
    return;
  }
  await extractAssets();
  await buildManifest();
}

await main();
