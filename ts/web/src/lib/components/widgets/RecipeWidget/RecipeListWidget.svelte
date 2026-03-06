<script lang="ts">
  import type { ClassValue } from 'clsx';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
  import RecipeWidget from '$lib/components/widgets/RecipeWidget/RecipeWidget.svelte';
  import { cn } from '$lib/utils';

  type RecipeListWidgetProps = {
    recipes: Recipe[];
    class?: ClassValue | undefined | null;
  };
  const { recipes, class: className }: RecipeListWidgetProps = $props();
</script>

<ScrollArea
  class={cn('w-full rounded-md border whitespace-nowrap', className)}
  orientation="horizontal"
>
  <div class="flex w-max space-x-4 p-4">
    {#each recipes as recipe (recipe.id)}
      <RecipeWidget class="w-sm overflow-hidden" {recipe} />
    {/each}
  </div>
</ScrollArea>
