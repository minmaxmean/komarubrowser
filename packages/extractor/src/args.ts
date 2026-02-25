import * as path from "path";
import { ExtractAssetsArgs } from "./extract";

export function getJarEnv(): ExtractAssetsArgs {
  const REQUIRED_ENV = ["star_t_data_dir", "dumps_from_mod_dir", "extracted_pngs_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    MODS_DIR: path.join(process.env.star_t_data_dir!, "mods"),
    INGREDIENTS_FILE: path.join(process.env.dumps_from_mod_dir!, "ingredients.json"),
    JAR_OUTPUT_DIR: path.join(process.env.extracted_pngs_dir!),
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
