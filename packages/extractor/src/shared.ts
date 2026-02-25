import * as fs from "fs/promises";
import * as path from "path";

export function getJarEnv() {
  const REQUIRED_ENV = ["star_t_dir", "raw_assets_dir", "assets_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    MODS_DIR: path.join(process.env.star_t_dir!, "mods"),
    INGREDIENTS_FILE: path.join(process.env.raw_assets_dir!, "dump", "ingredients.json"),
    JAR_OUTPUT_DIR: path.join(process.env.assets_dir!, "extracted"),
  };
}

// :db
export function getDBEnv() {
  const REQUIRED_ENV = ["raw_assets_dir", "assets_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    INGREDIENTS_FILE: path.join(process.env.raw_assets_dir!, "dump", "ingredients.json"),
    RECIPES_FILE: path.join(process.env.raw_assets_dir!, "dump", "recipes.json"),
    EXTRACTED_PNG_DIR: path.join(process.env.assets_dir!, "extracted"),
    DB_OUTPUT: path.join(process.env.assets_dir!, "dump", "assets.db"),
  };
}

// :minify
export function getMinifyEnv() {
  const REQUIRED_ENV = ["raw_assets_dir", "assets_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    MINIFY_INPUT_DIR: path.join(process.env.raw_assets_dir!, "dump"),
    MINIFY_OUTPUT_DIR: path.join(process.env.assets_dir!, "dump"),
  };
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function atomicMove(src: string, dest: string): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  try {
    // Try simple rename first
    await fs.rename(src, dest);
  } catch (err: any) {
    if (err.code === "EXDEV") {
      // Cross-device link, fallback to copy + delete
      const stat = await fs.stat(src);
      if (stat.isDirectory()) {
        await copyDir(src, dest);
        await fs.rm(src, { recursive: true });
      } else {
        await fs.copyFile(src, dest);
        await fs.unlink(src);
      }
    } else {
      throw err;
    }
  }
}
