import { type IngredientGlobalFilter } from "./ingredientRepo.js";

export type GlobalFilter = {
  ingredient: IngredientGlobalFilter;
};

export type GlobalFilterGetter = () => GlobalFilter;
