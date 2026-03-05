<script lang="ts">
  import IngredientInput from '$lib/components/widgets/IngredientInput/IngredientInput.svelte';
  import type { Searcher } from '$lib/components/widgets/IngredientInput/search';
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { FullRecipeCategory } from '$lib/db/recipeCategoryRepo';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  const offset = 0;
  const pageSize = 10;
  let inputFilter = $state<Ingredient | undefined>();
  let outputFilter = $state<Ingredient | undefined>();
  let machineFilter = $state<FullRecipeCategory | undefined>();

  const ingSearcher: Searcher<Ingredient> = $derived(
    async (_, f, p) => (await dbStore.data?.ingredients.search(f, p)) ?? [],
  );
  const machineSearcher: Searcher<FullRecipeCategory> = $derived(
    async (_, f, p) =>
      (await dbStore.data?.recipeCategory.search({ mode: 'or', ingredientFilter: f }, p)) ?? [],
  );

  const recipes = $derived(
    dbStore.data?.recipe.search(
      {
        mode: 'and',
        recipeType: machineFilter?.recipe_type,
        inputIngredientIncludes: inputFilter?.id,
        outputIngredientIncludes: outputFilter?.id,
      },
      { offset, limit: pageSize },
    ),
  );
</script>

<div class="flex flex-col gap-2">
  <IngredientInput
    bind:selectedItem={inputFilter}
    search={ingSearcher}
    getId={(item) => item.id}
    getIngredient={(item) => item}
  />
  <IngredientInput
    bind:selectedItem={outputFilter}
    search={ingSearcher}
    getId={(item) => item.id}
    getIngredient={(item) => item}
  />
  <IngredientInput
    bind:selectedItem={machineFilter}
    search={machineSearcher}
    getId={(item) => item.recipe_type}
    getIngredient={(item) => item.machine}
  />

  <RecipeListWidget recipes={(await recipes) ?? []} />
</div>
