import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { buildManifestItems } from "./manifest.js";
import { initDb, insertIngredients, insertManifest, insertRecipes } from "./database.js";
import { getDBEnv } from "./shared.js";
import { parseNamespace, type Ingredient, type Recipe } from "@komarubrowser/common/types";
import type { IngredientRow, RecipeRow } from "@komarubrowser/common/tables";
import { atomicMove, rmrf } from "./utils.js";

export async function buildDb(): Promise<void> {
  const { INGREDIENTS_FILE, RECIPES_FILE, DB_OUTPUT, EXTRACTED_PNG_DIR } = getDBEnv();
  console.log("Building SQLite database...");

  const tempDbPath = path.join(os.tmpdir(), `komaru-assets-${Math.random().toString(36).slice(2)}.db`);
  const db = await initDb(tempDbPath);

  try {
    // 1. Process Manifest
    const manifestRows = await buildManifestItems(EXTRACTED_PNG_DIR);
    console.log(`Inserting ${manifestRows.length} manifest entries...`);
    insertManifest(db, manifestRows);

    // Create a set for fast lookup: "jar/mod/type/filename"
    const manifestSet = new Set(manifestRows.map((m) => `${m.jar}/${m.mod}/${m.type}/${m.filename}`));

    // 2. Process Ingredients
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

    const ingredientRows: IngredientRow[] = Array.from(deduplicated.values()).map((i) => {
      const [namespace, png_id] = parseNamespace(i.id);
      const type = i.isFluid ? "block" : "item";
      const filename = `${png_id}.png`;
      const sourceJar = i.sourceJar || "";

      const manifestPath = `${sourceJar}/${namespace}/${type}/${filename}`;
      const hasIcon = manifestSet.has(manifestPath);
      const iconUrl = hasIcon ? `/assets/extracted/${manifestPath}` : null;

      return {
        id: i.id,
        display_name: i.displayName,
        is_fluid: i.isFluid ? 1 : 0,
        tags: JSON.stringify(i.tags),
        source_jar: sourceJar,
        icon_url: iconUrl,
      };
    });

    console.log(`Inserting ${ingredientRows.length} ingredients (deduplicated from ${ingredients.length})...`);
    insertIngredients(db, ingredientRows);

    // 3. Process Recipes
    console.log(`Reading recipes from ${RECIPES_FILE}...`);
    const recipesRaw = await fs.readFile(RECIPES_FILE, "utf-8");
    const recipes: Recipe[] = JSON.parse(recipesRaw);

    const recipeRows: RecipeRow[] = recipes.map((r) => ({
      id: r.id,
      machine: r.machine,
      inputs: JSON.stringify(r.inputs),
      outputs: JSON.stringify(r.outputs),
      duration: r.duration,
      min_tier: r.minTier,
      eut_consumed: r.eutConsumed,
      eut_produced: r.eutProduced,
    }));

    console.log(`Inserting ${recipeRows.length} recipes...`);
    insertRecipes(db, recipeRows);

    db.close();

    console.log(`Committing database to ${DB_OUTPUT}...`);
    await atomicMove(tempDbPath, DB_OUTPUT);

    console.log(`Database successfully built at ${DB_OUTPUT}`);
  } catch (err) {
    db.close();
    try {
      await rmrf(tempDbPath);
    } catch {}
    throw err;
  }
}
