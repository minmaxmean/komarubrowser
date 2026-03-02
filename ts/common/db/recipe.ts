import type { Insertable, JSONColumnType, Selectable } from "kysely";
import { EnergyTierID } from "../types/energyTier";

export type RecipeIngredient = {
  accepted_ids: string[];
  amount: number;
  chance: number; // 100_00 represents 100%
  perTick: boolean;
};

export type RecipeTable = {
  id: string;
  machine: string;
  inputs: JSONColumnType<RecipeIngredient[]>;
  outputs: JSONColumnType<RecipeIngredient[]>;
  duration: number;
  min_tier: EnergyTierID;
  eut_consumed: number;
  eut_produced: number;
};

export type Recipe = Selectable<RecipeTable>;
export type NewRecipe = Insertable<RecipeTable>;
