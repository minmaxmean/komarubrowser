export type IngredientID = string;

export type IngredientTag = string;

export type Ingredient = {
  id: IngredientID;
  displayName: string;
  isFluid: boolean;
  tags: IngredientTag[];
  textureLocation: string;
};

export function ingredientUrl(item: Ingredient): string {
  return item.textureLocation;
}

export const ingredientIdFn = (item: Ingredient): string => item.id;
