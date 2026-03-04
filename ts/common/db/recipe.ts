import type { GeneratedAlways, Insertable, JSONColumnType, Selectable } from "kysely";
import { EnergyTierID } from "./energyTier.js";

export type RecipeIngredient = {
  accepted_ids: string[];
  amount: number;
  chance: number; // 100_00 represents 100%
  perTick: boolean;
};

export type RecipeTable = {
  id: string;
  recipe_type: string;
  inputs: JSONColumnType<RecipeIngredient[]>;
  outputs: JSONColumnType<RecipeIngredient[]>;
  duration: number;
  min_tier: EnergyTierID;
  eut_consumed: number;
  eut_produced: number;

  input_ids: GeneratedAlways<string>;
  output_ids: GeneratedAlways<string>;
};

export type Recipe = Selectable<RecipeTable>;
export type NewRecipe = Insertable<RecipeTable>;
