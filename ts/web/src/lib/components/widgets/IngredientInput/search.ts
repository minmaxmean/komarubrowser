import type { Pagination } from '$lib/db/common';
import type { IngredientFilter } from '$lib/db/ingredientRepo';

export type Searcher<T> = (
  query: string,
  filter: IngredientFilter,
  pagination: Pagination,
) => Promise<T[]>;
