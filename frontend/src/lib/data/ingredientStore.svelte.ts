import { type FetchStatus } from './common';
import { type Ingredient } from './ingredient';

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
			this.data = await resp.json();
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const ingredientStore = new IngredientStore();
