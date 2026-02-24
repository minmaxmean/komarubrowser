import * as fs from "fs/promises";
import "./shared.js";
import { extractAssets } from "./extract.js";
import { buildManifestItems } from "./manifest.js";
import { minifyJson } from "./minify.js";
import { initDb, insertIngredients, insertManifest } from "./database.js";
import { INGREDIENTS_FILE, DB_OUTPUT } from "./shared.js";
import type { Ingredient } from "@komarubrowser/common/types";
import type { IngredientRow } from "@komarubrowser/common/tables";

const args = process.argv.slice(2);

async function buildDb(): Promise<void> {
  console.log("Building SQLite database...");

  const db = await initDb();

  // 1. Process Ingredients
  console.log(`Reading ingredients from ${INGREDIENTS_FILE}...`);
  const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
  const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);

  const ingredientRows: IngredientRow[] = ingredients.map((i) => ({
    id: i.id,
    display_name: i.displayName,
    is_fluid: i.isFluid ? 1 : 0,
    tags: JSON.stringify(i.tags),
    asset_path: i.assetPath,
    source_jar: i.sourceJar || "",
  }));

  console.log(`Inserting ${ingredientRows.length} ingredients...`);
  insertIngredients(db, ingredientRows);

  // 2. Process Manifest
  const manifestRows = await buildManifestItems();
  console.log(`Inserting ${manifestRows.length} manifest entries...`);
  insertManifest(db, manifestRows);

  db.close();
  console.log(`Database successfully built at ${DB_OUTPUT}`);
}

async function main(): Promise<void> {
  if (args.includes("--extract")) {
    await extractAssets();
    return;
  } else if (args.includes("--build-db")) {
    await buildDb();
    return;
  } else if (args.includes("--minify")) {
    await minifyJson();
    return;
  } else {
    console.log("provide --extract|--build-db|--minify");
    process.exit(1);
  }
}


await main();
