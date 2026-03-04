import type { Pagination } from '$lib/db/common';
import type { IngredientFilter } from '$lib/db/ingredientRepo';
import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';

export type Searcher = (filter: IngredientFilter, pagination: Pagination) => Promise<Ingredient[]>;
