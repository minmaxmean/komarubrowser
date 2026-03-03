<script lang="ts">
  import RecipeListWidget from '$lib/components/widgets/RecipeWidget/RecipeListWidget.svelte';
  import { mockRecipies } from './data';
  const recipes = mockRecipies.concat(mockRecipies).map((r, idx) => ({ ...r, id: r.id + idx }));
</script>

<RecipeListWidget {recipes} />
