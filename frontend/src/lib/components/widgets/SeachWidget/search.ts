import { type Ingredient } from '$lib/data/ingredient';

export const filterByQuery = (items: Ingredient[], query: string, limit = 30) => {
	console.time('filterByQuery');
	query = query.toLowerCase();
	const scoredItems = items
		.map((item) => ({ score: scoreItem(item, query), item }) as const)
		.filter((p) => p.score > 0)
		.toSorted((a, b) => b.score - a.score);
	limit = Math.min(limit, scoredItems.length);
	const result = scoredItems.slice(0, limit);
	console.timeEnd('filterByQuery');
	return result;
};

export const scoreItem = (item: Ingredient, query: string): number => {
	if (item.displayName.includes(query)) {
		return query.length / item.displayName.length;
	}
	if (item.id.includes(query)) {
		return query.length / item.id.length;
	}
	return 0;
};

type ScoredIngredient = {
	item: Ingredient;
	score: number;
};

export class QueryEngine {
	private allItems: Ingredient[];
	private lastQuery = '';
	private lastScoredItems?: ScoredIngredient[];

	constructor(allItems: Ingredient[]) {
		this.allItems = allItems;
	}

	public reset() {
		this.lastQuery = '';
		this.lastScoredItems = undefined;
	}

	public query(query: string, limit = 30): ScoredIngredient[] {
		console.time('query()');
		query = query.toLowerCase();
		const scoredItems = this.allItems
			.map((item) => ({ score: scoreItem(item, query), item }) as const)
			.filter((p) => p.score > 0)
			.toSorted((a, b) => b.score - a.score);

		this.lastQuery = query;
		this.lastScoredItems = scoredItems;

		limit = Math.min(limit, scoredItems.length);
		const result = scoredItems.slice(0, limit);
		console.timeEnd('query()');
		return result;
	}
}
