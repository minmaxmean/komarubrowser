import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import "./shared.js";
import { extractAssets } from "./extract.js";
import { buildManifestItems } from "./manifest.js";
import { minifyJson } from "./minify.js";
import { initDb, insertIngredients, insertManifest } from "./database.js";
import { INGREDIENTS_FILE, DB_OUTPUT, atomicMove } from "./shared.js";
import type { Ingredient } from "@komarubrowser/common/types";
import type { IngredientRow } from "@komarubrowser/common/tables";

const args = process.argv.slice(2);

async function buildDb(): Promise<void> {
  console.log("Building SQLite database...");

  const tempDbPath = path.join(os.tmpdir(), `komaru-assets-${Math.random().toString(36).slice(2)}.db`);
  const db = await initDb(tempDbPath);

  try {
    // 1. Process Ingredients
    console.log(`Reading ingredients from ${INGREDIENTS_FILE}...`);
    const ingredientsRaw = await fs.readFile(INGREDIENTS_FILE, "utf-8");
    const ingredients: Ingredient[] = JSON.parse(ingredientsRaw);

    const deduplicated = new Map<string, Ingredient>();
    for (const i of ingredients) {
      const existing = deduplicated.get(i.id);
      if (!existing || (!existing.isFluid && i.isFluid)) {
        deduplicated.set(i.id, i);
      }
    }

    const ingredientRows: IngredientRow[] = Array.from(deduplicated.values()).map((i) => ({
      id: i.id,
      display_name: i.displayName,
      is_fluid: i.isFluid ? 1 : 0,
      tags: JSON.stringify(i.tags),
      asset_path: i.assetPath,
      source_jar: i.sourceJar || "",
    }));

    console.log(`Inserting ${ingredientRows.length} ingredients (deduplicated from ${ingredients.length})...`);
    insertIngredients(db, ingredientRows);

    // 2. Process Manifest
    const manifestRows = await buildManifestItems();
    console.log(`Inserting ${manifestRows.length} manifest entries...`);
    insertManifest(db, manifestRows);

    db.close();

    console.log(`Committing database to ${DB_OUTPUT}...`);
    await atomicMove(tempDbPath, DB_OUTPUT);

    console.log(`Database successfully built at ${DB_OUTPUT}`);
  } catch (err) {
    db.close();
    try {
      await fs.unlink(tempDbPath);
    } catch {}
    throw err;
  }
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
