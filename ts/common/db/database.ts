import { type Dialect, Kysely, ParseJSONResultsPlugin } from "kysely";
import type { IngredientTable } from "./ingredient.js";
import type { ManifestTable } from "./manifest.js";
import { RecipeTable } from "./recipe.js";
import { RecipeCategoryTable } from "./recipeType.js";

export type Database = {
  ingredient: IngredientTable;
  manifest: ManifestTable;
  recipe: RecipeTable;
  recipe_category: RecipeCategoryTable;
};

export type KyselyDB = Kysely<Database>;

export const getDb = (dialect: Dialect, enableLogging = true): KyselyDB =>
  new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
    log: enableLogging ? ["query", "error"] : undefined,
  });
