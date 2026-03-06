<script lang="ts">
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import { recipeCategoryId } from '@komarubrowser/common/db/recipeType.js';
  import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
  import IngredientInput from '$lib/components/widgets/IngredientInput/IngredientInput.svelte';
  import RecipeWidget from '$lib/components/widgets/RecipeWidget/RecipeWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { FullRecipeCategory } from '$lib/db/recipeCategoryRepo';
  import { ingSearcher, machineSearcher } from './searchers';

  type Props = {
    pageSize?: number;
    selectedItems?: Recipe[];
  };

  const { pageSize = 10, selectedItems = $bindable([]) }: Props = $props();

  let inputFilter = $state<Ingredient | undefined>();
  let outputFilter = $state<Ingredient | undefined>();
  let machineFilter = $state<FullRecipeCategory | undefined>();

  const recipes = $derived(
    dbStore.data?.recipe.search(
      {
        mode: 'and',
        recipeType: machineFilter?.recipe_type,
        inputIngredientIncludes: inputFilter?.id,
        outputIngredientIncludes: outputFilter?.id,
      },
      { offset: 0, limit: pageSize },
    ),
  );
  const idx = $derived((item: Recipe) => selectedItems.findIndex((i) => i.id === item.id));
  const onToggle = (item: Recipe) => {
    const selectedIdx = idx(item);
    if (selectedIdx < 0) {
      selectedItems.push(item);
    } else {
      selectedItems.splice(selectedIdx, 1);
    }
  };
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-col gap-4 px-4">
    <IngredientInput
      bind:selectedItem={inputFilter}
      placeholder="Filter by input"
      search={ingSearcher(dbStore.data)}
      getId={(item) => item.id}
      getIngredient={(item) => item}
    />
    <IngredientInput
      bind:selectedItem={outputFilter}
      placeholder="Filter by output"
      search={ingSearcher(dbStore.data)}
      getId={(item) => item.id}
      getIngredient={(item) => item}
    />
    <IngredientInput
      bind:selectedItem={machineFilter}
      placeholder="Filter by recipe type"
      search={machineSearcher(dbStore.data)}
      getId={recipeCategoryId}
      getIngredient={(item) => item.machine}
    />
  </div>

  <ScrollArea class="w-full rounded-md border whitespace-nowrap" orientation="horizontal">
    {#if selectedItems.length > 0}
      <div class="flex w-max space-x-4 p-4">
        {#each selectedItems as recipe (recipe.id)}
          <RecipeWidget
            class="w-sm overflow-hidden"
            {recipe}
            {onToggle}
            selected={idx(recipe) != -1}
          />
        {/each}
      </div>
    {/if}

    <div class="flex w-max space-x-4 p-4">
      {#each await recipes as recipe (recipe.id)}
        <RecipeWidget
          class="w-sm overflow-hidden"
          {recipe}
          {onToggle}
          selected={idx(recipe) != -1}
        />
      {/each}
    </div>
  </ScrollArea>
</div>
