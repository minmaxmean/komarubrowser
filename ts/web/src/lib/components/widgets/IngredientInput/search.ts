import type { Pagination } from '@komarubrowser/common/db/common.js';
import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
import type { SuperRepo } from '@komarubrowser/common/db/repo.js';

export type Searcher = (query: string, pagination: Pagination) => Promise<Ingredient[]>;

export const ingredientSearcher =
  (db: SuperRepo | null): Searcher =>
  async (query: string, pagination: Pagination) =>
    db?.ingredients.search(
      {
        mode: 'or',
        idLike: query.toLowerCase(),
        displayNameLike: query,
      },
      pagination,
    ) ?? [];
