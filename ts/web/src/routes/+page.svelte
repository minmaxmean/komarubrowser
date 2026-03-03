<script lang="ts">
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  const recipiesPromise = $derived(dbStore.data?.recipe.all());
  const offset = 200;
  const pageSize = 10;
  const recipes = $derived((await recipiesPromise)?.slice(offset, offset + pageSize));
</script>

<RecipeListWidget recipes={recipes ?? []} />
