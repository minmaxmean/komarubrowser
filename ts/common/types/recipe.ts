import type { EnergyTierID } from './energyTier.js';
import type { IngredientID } from './ingredient.js';

export type RecipeID = string;
export type MachineID = string;

export type RecipeIngredient = {
	acceptedIds: IngredientID[];
	amount: number;
	chance: number; // 100_00 represents 100%
	perTick: boolean;
};

export type Recipe = {
	id: RecipeID;
	machine: MachineID;
	inputs: RecipeIngredient[];
	outputs: RecipeIngredient[];
	duration: number;

	minTier: EnergyTierID;
	eutConsumed: number;
	eutProduced: number;
};
