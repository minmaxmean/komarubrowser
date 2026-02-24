import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { INPUT_PATH, OUTPUT_PATH, pathExists, atomicMove } from "./shared.js";

export async function minifyJson(): Promise<void> {
  console.log(`Looking for JSON files in: ${INPUT_PATH}`);

  if (!(await pathExists(INPUT_PATH))) {
    console.error(`Error: Directory ${INPUT_PATH} does not exist.`);
    process.exit(1);
  }

  const stagingBase = await fs.mkdtemp(path.join(os.tmpdir(), "komaru-minify-"));

  try {
    const files = await fs.readdir(INPUT_PATH);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log(`No JSON files found in ${INPUT_PATH}`);
      await fs.rm(stagingBase, { recursive: true });
      return;
    }

    for (const filename of jsonFiles) {
      const inputFile = path.join(INPUT_PATH, filename);
      const outputFile = path.join(stagingBase, filename.replace(/\.json$/, ".min.json"));
      console.log(`Minifying ${filename}...`);
      const content = await fs.readFile(inputFile, "utf-8");
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      await fs.writeFile(outputFile, minified);
      console.log(`  minified to staging area`);
    }

    console.log(`Committing minified files to ${OUTPUT_PATH}...`);
    if (await pathExists(OUTPUT_PATH)) {
      await fs.rm(OUTPUT_PATH, { recursive: true });
    }
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await atomicMove(stagingBase, OUTPUT_PATH);

    console.log(`Successfully minified ${jsonFiles.length} files.`);
    console.log(`  Output folder: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Minification failed, cleaning up staging area...");
    await fs.rm(stagingBase, { recursive: true, force: true });
    throw err;
  }
}
