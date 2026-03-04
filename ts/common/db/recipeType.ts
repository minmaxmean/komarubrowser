import type { Insertable, JSONColumnType, Selectable } from "kysely";

export type RecipeTypeTable = {
  recipe_type: string;
  display_machine: string;
  all_machines: JSONColumnType<string[]>;
};

export type RecipeType = Selectable<RecipeTypeTable>;
export type NewRecipeType = Insertable<RecipeTypeTable>;

export const ingredientIdFn = (item: RecipeType): string => item.recipe_type;
