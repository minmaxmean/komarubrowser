import type { Insertable, JSONColumnType, Selectable } from "kysely";

export type RecipeCategoryTable = {
  recipe_type: string;
  recipe_category: string;
  display_name: string;
  machine_id: string;
  all_machines: JSONColumnType<string[]>;
};

export type RecipeCategory = Selectable<RecipeCategoryTable>;
export type NewRecipeCategory = Insertable<RecipeCategoryTable>;

export const recipeCategoryId = (item: RecipeCategory): string => `${item.recipe_type}/${item.recipe_category}`;
