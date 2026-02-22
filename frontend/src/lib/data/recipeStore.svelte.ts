import { type FetchStatus } from './common';
import { type Recipe } from './recipe';

const RECIPES_URL = '/assets/dump/recipes.min.json';

class RecipeStore {
	public data = $state<Recipe[]>([]);
	public status = $state<FetchStatus>('idle');
	async fetch() {
		if (this.data.length > 0) {
			return;
		}
		this.status = 'loading';
		try {
			const resp = await fetch(RECIPES_URL);
			this.data = await resp.json();
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const recipeStore = new RecipeStore();
