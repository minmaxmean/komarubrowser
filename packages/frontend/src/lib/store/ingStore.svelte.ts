import { type FetchStatus } from '$lib/types/common';
import type { Ingredient } from '$lib/types/ingredient';
import { preprocessIngredients } from './preprocess';

const INGREDIENTS_URL = '/assets/dump/ingredients.min.json';

class IngredientStore {
	public data = $state<Ingredient[]>([]);
	public status = $state<FetchStatus>('idle');
	async fetch() {
		if (this.data.length > 0) {
			return;
		}
		this.status = 'loading';
		try {
			const resp = await fetch(INGREDIENTS_URL);
			this.data = preprocessIngredients(await resp.json());
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const ingredientStore = new IngredientStore();
