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
	if (item.isFluid) {
		return `assets/extracted/gtceu-1.20.1-1.6.4.jar/gtceu/block/fluid.helium.png`;
	}
	return `assets/extracted/appliedenergistics2-forge-15.4.10.jar/ae2/item/basic_card.png`;
	const [namespace, png_id] = parseNamespace(item.id);
	const type = item.isFluid ? 'block' : 'item';
	return `/assets/extracted/${item.sourceJar}/${namespace}/${type}/${png_id}.png`;
}

export const ingredientIdFn = (item: Ingredient): string => item.id;
