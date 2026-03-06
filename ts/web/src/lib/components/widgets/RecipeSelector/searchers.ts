import type { Ingredient } from '@komarubrowser/common/db/ingredient';
import type { SuperRepo } from '$lib/db/dbStore.svelte';
import type { FullRecipeCategory } from '$lib/db/recipeCategoryRepo';
import type { Searcher } from '../IngredientInput/search';

export const ingSearcher =
  (repo: SuperRepo | null): Searcher<Ingredient> =>
  async (_, f, p) =>
    repo?.ingredients.search(f, p) ?? [];

export const machineSearcher =
  (repo: SuperRepo | null): Searcher<FullRecipeCategory> =>
  async (q, f, p) =>
    repo?.recipeCategory.search(
      {
        mode: 'or',
        machineFilter: f,
        recipeCategoryLike: q,
        recipeTypeLike: q,
        displayNameLike: q,
      },
      p,
    ) ?? [];
