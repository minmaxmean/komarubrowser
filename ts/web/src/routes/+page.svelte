<script>
  import RecipeWidget from '$lib/components/widgets/RecipeWidget/RecipeWidget.svelte';
  import { mockRecipies } from './data';
  const item = mockRecipies[0];
</script>

<div class="flex w-full max-w-md flex-col gap-6">
  <RecipeWidget recipe={item} />
</div>
