import { IngredientRepo } from "./ingredientRepo.js";
import { RecipeRepo } from "./recipeRepo.js";
import { ManifestRepo } from "./manifestRepo.js";
import { getDb } from "@komarubrowser/common/db/database.js";
import type { Dialect } from "kysely";
import type { GlobalFilterGetter } from "./globalFilter.js";

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  recipe: RecipeRepo;
  close: () => Promise<void>;
};


export const getSuperRepo = (dialect: Dialect, globalFilterGetter: GlobalFilterGetter): SuperRepo => {
  const db = getDb(dialect);
  return {
    ingredients: new IngredientRepo(db, globalFilterGetter),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    close: () => db.destroy(),
  };
};
