import { Kysely } from "kysely";
import type { IngredientTable } from "./ingredient.js";
import type { ManifestTable } from "./manifest.js";
import { RecipeTable } from "./recipe.js";

export type Database = {
  ingredient: IngredientTable;
  manifest: ManifestTable;
  recipe: RecipeTable;
};

export type KyselyDB = Kysely<Database>;
