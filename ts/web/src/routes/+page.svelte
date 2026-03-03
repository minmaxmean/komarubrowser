<script lang="ts">
  import Input from '$lib/components/ui/input/input.svelte';
  import IngredientInput from '$lib/components/widgets/IngredientInput/IngredientInput.svelte';
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  const offset = 0;
  const pageSize = 4;
  let inputFilter = $state('');

  const recipes = $derived(
    dbStore.data?.recipe.search(
      { inputIngredientIncludes: inputFilter },
      { offset, limit: pageSize },
    ),
  );
</script>

<div class="flex flex-col gap-2">
  <IngredientInput />

  <Input bind:value={inputFilter} />

  <RecipeListWidget recipes={(await recipes) ?? []} />
</div>
