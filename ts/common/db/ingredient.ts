import type { Insertable, JSONColumnType, Selectable } from "kysely";
import type { Manifest } from "./manifest.js";

export type IngredientTable = {
  id: string;
  display_name: string;
  is_fluid: number;
  tags: JSONColumnType<string[]>;
  source_jar: string;
  original_texture_location: string;
  texture_location: string | null;
  hex_color?: string;
};

export type Ingredient = Selectable<IngredientTable>;
export type NewIngredient = Insertable<IngredientTable>;

export type IngredientWithIcon = Ingredient & {
  icon?: Manifest;
};

export const ingredientIdFn = (item: Ingredient): string => item.id;
