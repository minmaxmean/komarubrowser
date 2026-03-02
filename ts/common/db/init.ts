import { Kysely, type Dialect } from "kysely";
import { Database } from "./database.js";
import { IngredientRepo } from "./ingredientRepo.js";

export type SuperRepo = {
  ingredients: IngredientRepo;
};
export const getSuperRepo = (dialect: Dialect): SuperRepo => {
  const db = new Kysely<Database>({ dialect });
  return {
    ingredients: new IngredientRepo(db),
  };
};
