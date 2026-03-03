import { Kysely, ParseJSONResultsPlugin, sql, type Dialect } from "kysely";
import { Database } from "./database.js";
import { IngredientRepo } from "./ingredientRepo.js";
import { RecipeRepo } from "./recipeRepo.js";
import { ManifestRepo } from "./manifestRepo.js";
import { GlobalFilterGetter } from "./globalFilter.js";

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  recipe: RecipeRepo;
  close: () => Promise<void>;
};

export const getSuperRepo = (dialect: Dialect, globalFilterGetter?: GlobalFilterGetter): SuperRepo => {
  const db = new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
    log: ["query", "error"],
  });
  return {
    ingredients: new IngredientRepo(db, globalFilterGetter),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    close: () => db.destroy(),
  };
};
