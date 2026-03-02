import { Kysely, type Dialect } from "kysely";
import { Database } from "./database.js";
import { IngredientRepo } from "./ingredientRepo.js";
import { ManifestRepo } from "./manifestRepo.js";
import { RecipeRepo } from "./recipeRepo.js";

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  recipe: RecipeRepo;
  close: () => Promise<void>;
};
export const getSuperRepo = (dialect: Dialect): SuperRepo => {
  const db = new Kysely<Database>({ dialect });
  return {
    ingredients: new IngredientRepo(db),
    manifest: new ManifestRepo(db),
    recipe: new RecipeRepo(db),
    close: () => db.destroy(),
  };
};
