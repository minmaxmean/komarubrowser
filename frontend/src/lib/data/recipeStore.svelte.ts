import { type FetchStatus } from './common';
import { type Recipe } from './recipe';

const RECIPES_URL = '/assets/dump/recipes.min.json';

function getUniqueMachines(recipes: Recipe[]): string[] {
	const allMachines = recipes.map((recipe) => recipe.machine);
	return [...new Set(allMachines)];
}

class RecipeStore {
	public data = $state<Recipe[]>([]);
	public status = $state<FetchStatus>('idle');
	public machines = $derived(() => getUniqueMachines(this.data));
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
