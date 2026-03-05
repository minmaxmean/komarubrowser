import type { GeneratedAlways, Insertable, JSONColumnType, Selectable } from "kysely";
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

  namespace: GeneratedAlways<string>;
};

export const INGREDIENT_COLUMNS: (keyof IngredientTable)[] = [
  "id",
  "display_name",
  "is_fluid",
  "tags",
  "source_jar",
  "original_texture_location",
  "texture_location",
  "hex_color",
  "namespace",
] as const;

export type Ingredient = Selectable<IngredientTable>;
export type NewIngredient = Insertable<IngredientTable>;

export type IngredientWithIcon = Ingredient & {
  icon?: Manifest;
};

export const ingredientIdFn = (item: Ingredient): string => item.id;

export type Machine = { machine: string } & (Ingredient | {});
