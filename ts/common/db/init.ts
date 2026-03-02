import { Kysely, type Dialect } from "kysely";
import { Database } from "./database.js";
import { IngredientRepo } from "./ingredientRepo.js";
import { ManifestRepo } from "./manifestRepo.js";

export type SuperRepo = {
  ingredients: IngredientRepo;
  manifest: ManifestRepo;
  close: () => Promise<void>;
};
export const getSuperRepo = (dialect: Dialect): SuperRepo => {
  const db = new Kysely<Database>({ dialect });
  return {
    ingredients: new IngredientRepo(db),
    manifest: new ManifestRepo(db),
    close: () => db.destroy(),
  };
};
