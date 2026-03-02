import type { ScorerFn } from './scorers';

type ScoredItem<I> = {
	item: I;
	score: number;
};

export class QueryEngine<I> {
	private allItems: I[];
	private lastQuery = '';
	private lastScoredItems: I[];

	private scorer: ScorerFn<I>;

	constructor(allItems: I[], scorer: ScorerFn<I>) {
		this.allItems = allItems;
		this.lastScoredItems = this.allItems;
		this.scorer = scorer;
	}

	public checkReset(query: string) {
		if (!query.includes(this.lastQuery)) {
			this.lastQuery = '';
			this.lastScoredItems = this.allItems;
		}
	}

	public query(query: string, limit = 30): ScoredItem<I>[] {
		query = query.toLowerCase();
		this.checkReset(query);

		const scoredItems = this.lastScoredItems
			.map((item) => ({ score: this.scorer(item, query), item }) as const)
			.filter((p) => p.score > 0)
			.toSorted((a, b) => b.score - a.score);

		this.lastQuery = query;
		this.lastScoredItems = scoredItems.map((scored) => scored.item);

		limit = Math.min(limit, scoredItems.length);
		const result = scoredItems.slice(0, limit);
		return result;
	}
}
