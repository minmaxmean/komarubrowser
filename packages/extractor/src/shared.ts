import * as fs from "fs/promises";
import * as path from "path";

export const REQUIRED_ENV = ["star_t_dir", "raw_assets_dir", "assets_dir"] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const MODS_DIR = path.join(process.env.star_t_dir!, "mods");
export const INGREDIENTS_FILE = path.join(process.env.raw_assets_dir!, "dump", "ingredients.json");
export const OUTPUT_BASE = path.join(process.env.assets_dir!, "extracted");
export const MANIFEST_OUTPUT = path.join(process.env.raw_assets_dir!, "dump", "manifest.json");
export const INPUT_PATH = path.join(process.env.raw_assets_dir!, "dump");
export const OUTPUT_PATH = path.join(process.env.assets_dir!, "dump");

export const JAR_MAPPINGS: Record<string, string> = {
  "thermal_core-1.20.1-11.0.6.24.jar": "cofh_core-1.20.1-11.0.2.56.jar",
  "server-1.20.1-20230612.114412-srg.jar": "1.20.1.jar",
};

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
