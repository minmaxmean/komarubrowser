import { type Ingredient } from '$lib/data/ingredient';

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
			this.lastQuery = '';
			this.lastScoredItems = this.allItems;
		} else {
		}
	}

	public query(query: string, limit = 30): ScoredIngredient[] {
		query = query.toLowerCase();
		this.checkReset(query);

		const scoredItems = this.lastScoredItems
			.map((item) => ({ score: scoreItem(item, query), item }) as const)
			.filter((p) => p.score > 0)
			.toSorted((a, b) => b.score - a.score);

		this.lastQuery = query;
		this.lastScoredItems = scoredItems.map((scored) => scored.item);

		limit = Math.min(limit, scoredItems.length);
		const result = scoredItems.slice(0, limit);
		return result;
	}
}
