import { buildManifestItems } from "./manifest.js";
import { initDb, insertIngredients, insertManifest, insertRecipes } from "./database.js";
import { type Recipe } from "@komarubrowser/common/types";
import {
  IngredientJson,
  toIngredientRow,
  toRecipeRow,
  type IngredientRow,
  type RecipeRow,
} from "@komarubrowser/common/tables";
import * as utils from "./utils.js";
import { BuildDBArgs } from "./args.js";
import path from "path";

export async function buildDb({
  INGREDIENTS_FILE,
  RECIPES_FILE,
  DB_OUTPUT,
  EXTRACTED_PNG_DIR,
}: BuildDBArgs): Promise<void> {
  console.log("Building SQLite database...");

  const tempDbDir = await utils.makeTmpDir(`db`);
  const tempDbPath = path.join(tempDbDir, "komaru.db");
  const db = await initDb(tempDbPath);

  try {
    // 1. Process Manifest
    const manifestRows = await buildManifestItems(EXTRACTED_PNG_DIR);
    console.log(`Inserting ${manifestRows.length} manifest entries...`);
    insertManifest(db, manifestRows);

    // // Create a set for fast lookup: "jar/mod/type/filename"
    const manifestSet = new Set(manifestRows.map((m) => m.filepath));

    // 2. Process Ingredients
    console.log(`Reading ingredients from ${INGREDIENTS_FILE}...`);
    const ingredients: IngredientJson[] = await utils.readJson(INGREDIENTS_FILE);

    const deduplicated = new Map<string, IngredientJson>();
    for (const i of ingredients) {
      const existing = deduplicated.get(i.id);
      if (!existing || (!existing.isFluid && i.isFluid)) {
        deduplicated.set(i.id, i);
      }
    }

    const ingredientRows: IngredientRow[] = Array.from(deduplicated.values()).map((ing) =>
      toIngredientRow(ing, manifestSet),
    );
    console.log(`Inserting ${ingredientRows.length} ingredients (deduplicated from ${ingredients.length})...`);
    insertIngredients(db, ingredientRows);

    // 3. Process Recipes
    console.log(`Reading recipes from ${RECIPES_FILE}...`);
    const recipes: Recipe[] = await utils.readJson(RECIPES_FILE);
    const recipeRows: RecipeRow[] = recipes.map(toRecipeRow);

    console.log(`Inserting ${recipeRows.length} recipes...`);
    insertRecipes(db, recipeRows);

    db.close();

    console.log(`Committing database to ${DB_OUTPUT}...`);
    await utils.atomicMove(tempDbPath, DB_OUTPUT);

    console.log(`Database successfully built at ${DB_OUTPUT}`);
  } catch (err) {
    db.close();
    try {
      await utils.rmrf(tempDbPath);
    } catch {}
    throw err;
  }
}
