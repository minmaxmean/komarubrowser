import { EnergyTierID } from "../types/energyTier.js";
import { Recipe } from "../types/recipe.js";

export interface RecipeRow {
  id: string;
  machine: string;
  inputs: string;
  outputs: string;
  duration: number;
  min_tier: EnergyTierID;
  eut_consumed: number;
  eut_produced: number;
}

export const toRecipeRow = (r: Recipe): RecipeRow => ({
  id: r.id,
  machine: r.machine,
  inputs: JSON.stringify(r.inputs),
  outputs: JSON.stringify(r.outputs),
  duration: r.duration,
  min_tier: r.minTier,
  eut_consumed: r.eutConsumed,
  eut_produced: r.eutProduced,
});

export const fromRecipeRow = (r: RecipeRow): Recipe => ({
  id: r.id,
  machine: r.machine,
  inputs: JSON.parse(r.inputs),
  outputs: JSON.parse(r.outputs),
  duration: r.duration,
  minTier: r.min_tier,
  eutConsumed: r.eut_consumed,
  eutProduced: r.eut_produced,
});
