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
		.toSorted((a, b) => {
			if (a.id < b.id) {
				return -1;
			}
			if (a.id > b.id) {
				return 1;
			}
			if (a.isFluid != b.isFluid) {
				if (a.isFluid) {
					return -1;
				} else {
					return 1;
				}
			}
			return 0;
		})
		.filter((_, idx, arr) => {
			if (idx > 0 && arr[idx].id === arr[idx - 1].id) {
				if (arr[idx - 1].isFluid == arr[idx].isFluid) {
					console.warn('Duplicate Ingredients', arr[idx - 1], arr[idx]);
				}
				return false;
			}
			return true;
		})
		.map((item) => {
			item.displayName = item.displayName.replace(/§./gs, '');
			return item;
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
