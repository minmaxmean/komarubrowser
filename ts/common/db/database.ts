import { type Dialect, Kysely, ParseJSONResultsPlugin } from "kysely";
import type { IngredientTable } from "./ingredient.js";
import type { ManifestTable } from "./manifest.js";
import { RecipeTable } from "./recipe.js";
import { RecipeTypeTable } from "./recipeType.js";

export type Database = {
  ingredient: IngredientTable;
  manifest: ManifestTable;
  recipe: RecipeTable;
  recipe_type: RecipeTypeTable;
};

export type KyselyDB = Kysely<Database>;

export const getDb = (dialect: Dialect): KyselyDB =>
  new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
    log: ["query", "error"],
  });
