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
	if (query === '') {
		return 1;
	}
	if (item.displayName.toLowerCase().includes(query)) {
		return query.length / item.displayName.length;
	}
	if (item.id.toLowerCase().includes(query)) {
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
	private lastScoredItems: Ingredient[];

	constructor(allItems: Ingredient[]) {
		this.allItems = allItems;
		this.lastScoredItems = this.allItems;
	}

	public checkReset(query: string) {
		if (!query.includes(this.lastQuery)) {
			console.log(`RESET "${this.lastQuery}" -> "${query}"`);
			this.lastQuery = '';
			this.lastScoredItems = this.allItems;
		} else {
			console.log(`Good "${this.lastQuery}" -> "${query}"`);
		}
	}

	public query(query: string, limit = 30): ScoredIngredient[] {
		console.time('query()');
		query = query.toLowerCase();
		this.checkReset(query);
		console.log(
			`  lastScoredItems.length ${this.lastScoredItems.length}`,
			this.lastScoredItems.length > 0 ? this.lastScoredItems[0].displayName : null
		);

		const scoredItems = this.lastScoredItems
			.map((item) => ({ score: scoreItem(item, query), item }) as const)
			.filter((p) => p.score > 0)
			.toSorted((a, b) => b.score - a.score);
		console.log(
			`  scoredItems.length ${scoredItems.length}`,
			scoredItems.length > 0 ? scoredItems[0].item.displayName : null
		);

		this.lastQuery = query;
		this.lastScoredItems = scoredItems.map((scored) => scored.item);

		limit = Math.min(limit, scoredItems.length);
		const result = scoredItems.slice(0, limit);
		console.timeEnd('query()');
		console.log(
			`  new lastScoredItems.length ${this.lastScoredItems.length}`,
			this.lastScoredItems.length > 0 ? this.lastScoredItems[0].displayName : null
		);
		return result;
	}
}
