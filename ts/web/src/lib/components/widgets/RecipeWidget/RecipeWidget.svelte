<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import { getDisplayName, getItemIds } from './utils';
  import EnergyTierWidget from '../EnergyTier/EnergyTierWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { ClassValue } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import RecipeIngredientWidget from './RecipeIngredientWidget.svelte';

  type RecipeWidgetProps = {
    recipe: Recipe;
    class?: ClassValue | undefined | null;
  };
  const { recipe, class: className }: RecipeWidgetProps = $props();

  const itemIds = $derived(getItemIds(recipe));
  const items = $derived(await dbStore.data?.ingredients.getByIds(itemIds));
</script>

<Card.Root class={cn('w-sm text-center', className)}>
  <Card.Header class="px-0">
    <Card.Title>{getDisplayName(recipe.id)}</Card.Title>
    <Card.Description>{getDisplayName(recipe.machine, items)}</Card.Description>
  </Card.Header>
  <Card.Content class="px-0">
    <div class="flex flex-col gap-2">
      {#if recipe.inputs.length > 0}
        <div class="grid gap-2 bg-red-800">Input</div>
        {#each recipe.inputs as ingredient}
          {@const item = items?.get(ingredient.accepted_ids[0])}
          <RecipeIngredientWidget {ingredient} {item} />
        {/each}
      {/if}
      <div class="grid gap-2 bg-green-800">Ouptut</div>
      {#each recipe.outputs as ingredient}
        {@const item = items?.get(ingredient.accepted_ids[0])}
        <RecipeIngredientWidget {ingredient} {item} />
      {/each}
      <div class="grid gap-2 bg-yellow-800">Recipe</div>
      <div class="flex flex-row gap-2">
        <p class="flex-2 text-right">Base Duration</p>
        <p class="flex-1 text-right">{recipe.duration / 20}</p>
        <p class="flex-1 text-left">sec</p>
      </div>
      <div class="flex flex-row gap-2">
        <p class="flex-2 text-right">Base Voltage Tier</p>
        <p class="flex-1 text-right"><EnergyTierWidget tier={recipe.min_tier} /></p>
        <p class="flex-1 text-left"></p>
      </div>
      {#if recipe.eut_consumed > 0}
        <div class="flex flex-row gap-2">
          <p class="flex-2 text-right">Base Power Usage</p>
          <p class="flex-1 text-right">{recipe.eut_consumed}</p>
          <p class="flex-1 text-left">EU/t</p>
        </div>
      {/if}
      {#if recipe.eut_produced > 0}
        <div class="flex flex-row gap-2">
          <p class="flex-2 text-right">Base Power Production</p>
          <p class="flex-1 text-right">{recipe.eut_consumed}</p>
          <p class="flex-1 text-left">EU/t</p>
        </div>
      {/if}
    </div>
  </Card.Content>
</Card.Root>
