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
