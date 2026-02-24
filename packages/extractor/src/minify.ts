import * as fs from "fs/promises";
import * as path from "path";
import { INPUT_PATH, OUTPUT_PATH, pathExists } from "./shared.js";

export async function minifyJson(): Promise<void> {
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
