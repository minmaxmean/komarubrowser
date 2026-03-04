<script lang="ts">
  import IngredientInput from '$lib/components/widgets/IngredientInput/IngredientInput.svelte';
  import type { Searcher } from '$lib/components/widgets/IngredientInput/search';
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  const offset = 0;
  const pageSize = 10;
  let inputFilter = $state<Ingredient | undefined>();
  let outputFilter = $state<Ingredient | undefined>();
  let machineFilter = $state<Ingredient | undefined>();

  const ingSearcher: Searcher = $derived(
    async (f, p) => (await dbStore.data?.ingredients.search(f, p)) ?? [],
  );
  const machineSearcher: Searcher = $derived(
    async (f, p) => (await dbStore.data?.ingredients.searchMachines(f, p)) ?? [],
  );

  const recipes = $derived(
    dbStore.data?.recipe.search(
      {
        mode: 'and',
        machine: machineFilter?.id,
        inputIngredientIncludes: inputFilter?.id,
        outputIngredientIncludes: outputFilter?.id,
      },
      { offset, limit: pageSize },
    ),
  );

  const machines = $derived(
    await dbStore.data?.ingredients.searchMachines({ mode: 'or' }, { offset: 0, limit: 100 }),
  );
  $inspect(machines);
</script>

<div class="flex flex-col gap-2">
  <IngredientInput bind:selectedItem={inputFilter} search={ingSearcher} />
  <IngredientInput bind:selectedItem={outputFilter} search={ingSearcher} />
  <IngredientInput bind:selectedItem={machineFilter} search={machineSearcher} />

  <RecipeListWidget recipes={(await recipes) ?? []} />
</div>
