<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import type { Recipe } from '@komarubrowser/common/db/recipe';
  import { getDisplayName, getItemIds } from './utils';
  import EnergyTierWidget from '../EnergyTier/EnergyTierWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import type { ClassValue } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import RecipeIngredientWidget from './RecipeIngredientWidget.svelte';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';

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
    <Card.Description class="flex flex-row items-center justify-center gap-2">
      {getDisplayName(recipe.machine, items)}
      <IngredientIcon item={items?.get(recipe.machine)} />
    </Card.Description>
  </Card.Header>
  <Card.Content class="px-0">
    <div class="grid grid-cols-[3fr_auto_1fr_1fr] items-center gap-x-4 gap-y-2">
      {#if recipe.inputs.length > 0}
        <div class="col-span-4 bg-red-800 py-1">Input</div>
        {#each recipe.inputs as ingredient}
          {@const item = items?.get(ingredient.accepted_ids[0])}
          <RecipeIngredientWidget {ingredient} {item} />
        {/each}
      {/if}

      <div class="col-span-4 bg-green-800 py-1">Output</div>
      {#each recipe.outputs as ingredient}
        {@const item = items?.get(ingredient.accepted_ids[0])}
        <RecipeIngredientWidget {ingredient} {item} />
      {/each}

      <div class="col-span-4 bg-yellow-800 py-1">Recipe</div>

      <p class="text-right">Base Duration</p>
      <div></div>
      <p class="text-right">{recipe.duration / 20}</p>
      <p class="text-left">sec</p>

      <p class="text-right">Base Voltage Tier</p>
      <div></div>
      <div class="flex justify-end"><EnergyTierWidget tier={recipe.min_tier} /></div>
      <p class="text-left"></p>

      {#if recipe.eut_consumed > 0}
        <p class="text-right">Base Power Usage</p>
        <div></div>
        <p class="text-right">{recipe.eut_consumed}</p>
        <p class="text-left">EU/t</p>
      {/if}

      {#if recipe.eut_produced > 0}
        <p class="text-right">Base Power Production</p>
        <div></div>
        <p class="text-right">{recipe.eut_produced}</p>
        <p class="text-left">EU/t</p>
      {/if}
    </div>
  </Card.Content>
</Card.Root>
