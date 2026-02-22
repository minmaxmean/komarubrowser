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

const preprocessIngredients = (items: Ingredient[]): Ingredient[] =>
	items
		.filter((item) => {
			const [namespace, id] = ingredientNamesapce(item.id);
			if (disabledNamespaces.includes(namespace)) return false;
			if (id.includes('flowing')) {
				return false;
			}
			if (id.includes('bucket') && item.id != 'minecraft:bucket') {
				return false;
			}
			return true;
		})
		.toSorted(({ id: nameA }, { id: nameB }) => {
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		})
		.filter((_, idx, arr) => {
			if (idx > 0 && arr[idx].id === arr[idx - 1].id) {
				console.warn('Duplicate Ingredients', arr[idx - 1], arr[idx]);
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
			this.data = preprocessIngredients(await resp.json());
			this.status = 'successful';
		} catch (e: any) {
			console.error(e);
			this.status = 'error';
		}
	}
}

export const ingredientStore = new IngredientStore();
