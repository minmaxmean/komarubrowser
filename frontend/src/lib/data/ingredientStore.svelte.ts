import { type FetchStatus } from './common';
import { ingredientNamesapce, type Ingredient } from './ingredient';

const INGREDIENTS_URL = '/assets/dump/ingredients.min.json';

const disabledNamespaces = [
	'chipped',
	'rechiseled',
	'create',
	'xtonesreworked',
	'architects_palette',
	'chisel_chipped_integration'
];

const filterIngredients = (items: Ingredient[]): Ingredient[] =>
	items.filter((item) => {
		const [namespace, id] = ingredientNamesapce(item.id);
		if (disabledNamespaces.includes(namespace)) return false;
		if (id.includes('flowing')) {
			return false;
		}
		if (id.includes('bucket') && item.id != 'minecraft:bucket') {
			return false;
		}
		return true;
	});

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
			this.data = filterIngredients(await resp.json());
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const ingredientStore = new IngredientStore();
