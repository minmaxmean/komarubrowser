<script lang="ts">
  import { onMount } from 'svelte';
  import type { Recipe } from '@komarubrowser/common/db/recipe.js';
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
  $effect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedItems));
  });
  $inspect({ selectedItems });
</script>

<RecipeSelector bind:selectedItems />
