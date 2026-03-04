import { Kysely, ParseJSONResultsPlugin, type Dialect } from "kysely";
import { Database, KyselyDB } from "./database.js";
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

export const getDb = (dialect: Dialect): KyselyDB =>
  new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
    log: ["query", "error"],
  });

export const getSuperRepo = (dialect: Dialect, globalFilterGetter: GlobalFilterGetter): SuperRepo => {
  const db = getDb(dialect);
  return {
    ingredients: new IngredientRepo(db, globalFilterGetter),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    close: () => db.destroy(),
  };
};
