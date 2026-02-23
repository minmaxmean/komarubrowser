import { type FetchStatus } from '$lib/types/common';
import type { Recipe } from '$lib/types/recipe';

const RECIPE_URL = '/assets/dump/recipes.min.json';

class RecipeStore {
	public data = $state<Recipe[]>([]);
	public status = $state<FetchStatus>('idle');
	async fetch() {
		if (this.data.length > 0) {
			return;
		}
		this.status = 'loading';
		try {
			const resp = await fetch(RECIPE_URL);
			this.data = await resp.json();
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const recipeStore = new RecipeStore();
