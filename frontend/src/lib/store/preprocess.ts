import { parseNamespace } from '$lib/types/common';
import type { Ingredient } from '$lib/types/ingredient';

const disabledNamespaces = [
	'chipped',
	'rechiseled',
	'create',
	'xtonesreworked',
	'architects_palette',
	'chisel_chipped_integration',
	'thermal_extra'
];

export const preprocessIngredients = (items: Ingredient[]): Ingredient[] =>
	items
		.filter((item) => {
			const [namespace, id] = parseNamespace(item.id);
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
