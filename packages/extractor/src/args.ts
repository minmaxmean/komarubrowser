import * as path from "path";

export type ExtractPngArgs = {
  INGREDIENTS_FILE: string;
  SERVER_DIR: string;
  JAR_OUTPUT_DIR: string;
};

export function getExtractPngsArgs(): ExtractPngArgs {
  const REQUIRED_ENV = ["star_t_data_dir", "dumps_from_mod_dir", "extracted_pngs_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    SERVER_DIR: path.join(process.env.star_t_data_dir!),
    INGREDIENTS_FILE: path.join(process.env.dumps_from_mod_dir!, "ingredients.json"),
    JAR_OUTPUT_DIR: path.join(process.env.extracted_pngs_dir!),
  };
}

export type BuildDBArgs = {
  INGREDIENTS_FILE: string;
  RECIPES_FILE: string;
  EXTRACTED_PNG_DIR: string;
  DB_OUTPUT: string;
};

// :db
export function getBuildDBArgs(): BuildDBArgs {
  const REQUIRED_ENV = ["dumps_from_mod_dir", "extracted_pngs_dir", "db_dir"] as const;
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return {
    INGREDIENTS_FILE: path.join(process.env.dumps_from_mod_dir!, "ingredients.json"),
    RECIPES_FILE: path.join(process.env.dumps_from_mod_dir!, "recipes.json"),
    EXTRACTED_PNG_DIR: path.join(process.env.extracted_pngs_dir!),
    DB_OUTPUT: path.join(process.env.db_dir!, "komarku.db"),
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
