import { parseNamespace } from "./common";

export type IngredientID = string;

export type IngredientTag = string;

export type Ingredient = {
	id: IngredientID;
	displayName: string;
	isFluid: boolean;
	tags: IngredientTag[];
	assetPath: string;
	sourceJar: string;
};

export function ingredientUrl(item: Ingredient): string {
	const [namespace, png_id] = parseNamespace(item.id);
	const type = item.isFluid ? 'block' : 'item';
	return `/assets/extracted/${item.sourceJar}/${namespace}/${type}/${png_id}.png`;
}

export const ingredientIdFn = (item: Ingredient): string => item.id;
