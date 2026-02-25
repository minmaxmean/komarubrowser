import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { getMinifyEnv } from "./shared.js";
import { pathExists } from "./utils.js";
import { atomicMove } from "./atomicMove.js";

export async function minifyJson(): Promise<void> {
  const { MINIFY_INPUT_DIR, MINIFY_OUTPUT_DIR } = getMinifyEnv();
  console.log(`Looking for JSON files in: ${MINIFY_INPUT_DIR}`);

  if (!(await pathExists(MINIFY_INPUT_DIR))) {
    console.error(`Error: Directory ${MINIFY_INPUT_DIR} does not exist.`);
    process.exit(1);
  }

  const stagingBase = await fs.mkdtemp(path.join(os.tmpdir(), "komaru-minify-"));

  try {
    const files = await fs.readdir(MINIFY_INPUT_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log(`No JSON files found in ${MINIFY_INPUT_DIR}`);
      await fs.rm(stagingBase, { recursive: true });
      return;
    }

    for (const filename of jsonFiles) {
      const inputFile = path.join(MINIFY_INPUT_DIR, filename);
      const outputFile = path.join(stagingBase, filename.replace(/\.json$/, ".min.json"));
      console.log(`Minifying ${filename}...`);
      const content = await fs.readFile(inputFile, "utf-8");
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      await fs.writeFile(outputFile, minified);
      console.log(`  minified to staging area`);
    }

    console.log(`Committing minified files to ${MINIFY_OUTPUT_DIR}...`);
    if (await pathExists(MINIFY_OUTPUT_DIR)) {
      await fs.rm(MINIFY_OUTPUT_DIR, { recursive: true });
    }
    await fs.mkdir(path.dirname(MINIFY_OUTPUT_DIR), { recursive: true });
    await atomicMove(stagingBase, MINIFY_OUTPUT_DIR);

    console.log(`Successfully minified ${jsonFiles.length} files.`);
    console.log(`  Output folder: ${MINIFY_OUTPUT_DIR}`);
  } catch (err) {
    console.error("Minification failed, cleaning up staging area...");
    await fs.rm(stagingBase, { recursive: true, force: true });
    throw err;
  }
}
