<script lang="ts">
  import Chevron from '@lucide/svelte/icons/chevron-right';
  import { onMount } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe.js';
  import * as Collapsible from '$lib/components/ui/collapsible';
  import RecipeGraph from '$lib/components/widgets/RecipeGraph/RecipeGraph.svelte';
  import RecipeSelector from '$lib/components/widgets/RecipeSelector/RecipeSelector.svelte';

  let selectedItems = $state<Recipe[]>([]);
  const STORAGE_KEY = 'SELECTED_RECIPIES';
  onMount(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        selectedItems = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse recipes from storage', e);
      }
    }
  });

  // 3. Automatically save whenever selectedItems changes
  $effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedItems)));

  let searchOpen = $state(false);
</script>

<Collapsible.Root class="w-full rounded-md border whitespace-nowrap" bind:open={searchOpen}>
  <Collapsible.Trigger variant="ghost" size="lg" class="m-4 pl-0!">
    <Chevron class="transition-transform duration-200 {searchOpen ? 'rotate-90' : 'rotate-0'}" />
    Add Recipes
  </Collapsible.Trigger>
  <Collapsible.Content>
    <RecipeSelector bind:selectedItems />
  </Collapsible.Content>
</Collapsible.Root>

<RecipeGraph recipes={selectedItems} />
