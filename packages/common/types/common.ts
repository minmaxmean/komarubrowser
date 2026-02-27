import type { IngredientID } from './ingredient.js';
import type { RecipeID } from './recipe.js';

export type FetchStatus = 'idle' | 'loading' | 'error' | 'successful';

export const parseNamespace = (
	itemId: IngredientID | RecipeID
): [namespace: string, id: string] => {
	const parts = itemId.split(':', 2);
	if (parts.length === 2) {
		return parts as [string, string];
	}
	return ['minecraft', parts[0]];
};
