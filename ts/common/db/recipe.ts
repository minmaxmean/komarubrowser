import type { GeneratedAlways, Insertable, JSONColumnType, Selectable } from "kysely";
import type { EnergyTierID } from "./energyTier.js";

export type RecipeIngredient = {
  i: string; // accepted_ids
  a: number;
  c?: number; // 100_00 represents 100%
  perTick?: boolean;
};

export type RecipeTable = {
  id: string;
  recipe_type: string;
  recipe_category: string;
  inputs: JSONColumnType<RecipeIngredient[]>;
  outputs: JSONColumnType<RecipeIngredient[]>;
  duration: number;
  min_tier: EnergyTierID;
  eut_consumed: number;
  eut_produced: number;
};

export type Recipe = Selectable<RecipeTable>;
export type NewRecipe = Insertable<RecipeTable>;
