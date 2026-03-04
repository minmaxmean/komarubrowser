<script lang="ts">
  import IngredientInput from '$lib/components/widgets/IngredientInput/IngredientInput.svelte';
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  const offset = 0;
  const pageSize = 10;
  let inputFilter = $state<Ingredient | undefined>();
  let outputFilter = $state<Ingredient | undefined>();

  const recipes = $derived(
    dbStore.data?.recipe.search(
      {
        mode: 'and',
        inputIngredientIncludes: inputFilter?.id,
        outputIngredientIncludes: outputFilter?.id,
      },
      { offset, limit: pageSize },
    ),
  );
</script>

<div class="flex flex-col gap-2">
  <IngredientInput bind:selectedItem={inputFilter} />
  <IngredientInput bind:selectedItem={outputFilter} />

  <RecipeListWidget recipes={(await recipes) ?? []} />
</div>
