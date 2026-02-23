import type { Ingredient } from '$lib/types/ingredient';

export type ScorerFn<I> = (item: I, lowercaseQuery: string) => number;

export const scoreString: ScorerFn<string> = (item: string, query: string): number => {
	if (query === '') {
		return 1;
	}
	if (item.toLowerCase().includes(query)) {
		return query.length / item.length;
	}
	return 0;
};

export const scoreIngredient: ScorerFn<Ingredient> = (item: Ingredient, query: string): number => {
	return Math.max(scoreString(item.displayName, query), scoreString(item.id, query));
};
