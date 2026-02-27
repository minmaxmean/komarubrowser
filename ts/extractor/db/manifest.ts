import * as fs from "fs/promises";
import sizeOf from "image-size";
import cliProgress from "cli-progress";
import type { ManifestRow } from "../../common/tables/index.js";
import { pathExists } from "../utils/utils.js";
import path from "path";

async function getPngInfo(extractedDir: string, filepath: string): Promise<ManifestRow | null> {
  try {
    const fileBuffer = await fs.readFile(path.join(extractedDir, filepath));
    const dimensions = sizeOf(fileBuffer);
    return {
      filepath,
      width: dimensions.width || 0,
      height: dimensions.height || 0,
    };
  } catch (err) {
    return null;
  }
}

export async function buildManifestItems(extractedDir: string): Promise<ManifestRow[]> {
  console.log(`Building manifest for ${extractedDir}...`);

  if (!(await pathExists(extractedDir))) {
    console.error(`Error: Directory ${extractedDir} does not exist.`);
    process.exit(1);
  }

  const progressBar = new cliProgress.SingleBar({
    format: "  {bar} {percentage}% | {value}/{total} | {last_file}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  const pngGlob = "**/*.png";
  const files = await Array.fromAsync(fs.glob(pngGlob, { cwd: extractedDir }));

  console.log(`Found ${files.length} pngs in ${pngGlob}`);

  progressBar.start(files.length, 0, { last_file: "" });

  const results = await Promise.all(
    files.map(async (filepath) => {
      const png = await getPngInfo(extractedDir, filepath);
      progressBar.increment({ last_file: filepath });
      return png;
    }),
  );

  progressBar.stop();

  return results.filter((val) => val !== null);
}
