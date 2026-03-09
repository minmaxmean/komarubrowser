<script lang="ts">
  import Minus from '@lucide/svelte/icons/minus';
  import Plus from '@lucide/svelte/icons/plus';
  import type { Snippet } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { Recipe } from '@komarubrowser/common/db/recipe.js';
  import { Button } from '$lib/components/ui/button';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import { getTextProps } from '$lib/db/recipeCategoryRepo';
  import { cn } from '$lib/utils';
  import EnergyTierWidget from '../EnergyTier/EnergyTierWidget.svelte';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import RecipeIngredientWidget from './RecipeIngredientWidget.svelte';
  import { cleanAndCapitalize, getDisplayName, getItemIds, timeUnit } from './utils';

  type RecipeWidgetProps = {
    recipe: Recipe;
    class?: ClassValue | undefined | null;
    onToggle?: (item: Recipe) => void;
    selected?: boolean;
    withHandles?: boolean;
    action?: Snippet<[]>;
    machineSettings?: Snippet<[]>;
  };
  const {
    recipe,
    class: className,
    onToggle,
    selected,
    withHandles,
    action,
    machineSettings,
  }: RecipeWidgetProps = $props();

  const itemIds = $derived(getItemIds(recipe));
  const items = $derived(await dbStore.data?.ingredients.getByIds(itemIds));
  const recipeCategory = $derived(
    await dbStore.data?.recipeCategory.getById(recipe.recipe_type, recipe.recipe_category),
  );
  const dur = $derived(timeUnit(recipe.duration));
</script>

<div
  class={cn(
    'h-max w-xs rounded-xl border bg-card py-4 text-center relative',
    'grid grid-cols-[3fr_auto_1fr_1fr] items-center gap-x-4 gap-y-2',
    className,
  )}
>
  <div class="relative col-span-4 mb-4 flex items-center justify-center">
    <div class="text-lg font-bold">
      {cleanAndCapitalize(recipeCategory?.display_name ?? recipe.id)}
    </div>

    {#if onToggle}
      <Button
        size="icon-sm"
        variant="ghost"
        class="absolute right-4 hover:bg-muted"
        onclick={() => onToggle(recipe)}
      >
        {#if !selected}
          <Plus class="opacity-50" />
        {:else}
          <Minus class="opacity-50" />
        {/if}
      </Button>
    {/if}
    {@render action?.()}
  </div>

  <p class="text-right">{getDisplayName(recipe.recipe_type, items)}</p>
  <IngredientIcon {...getTextProps(recipeCategory)} />
  <p></p>
  <p></p>

  {#if recipe.inputs.length > 0}
    <div class="col-span-4 bg-(--input-block) py-1">Input</div>
    {#each recipe.inputs as ingredient}
      {@const item = items?.get(ingredient.i)}
      <RecipeIngredientWidget {ingredient} {item} handleType={withHandles && 'target'} />
    {/each}
  {/if}

  {#if recipe.outputs.length > 0}
    <div class="col-span-4 bg-(--output-block) py-1">Output</div>
    {#each recipe.outputs as ingredient}
      {@const item = items?.get(ingredient.i)}
      <RecipeIngredientWidget {ingredient} {item} handleType={withHandles && 'source'} />
    {/each}
  {/if}

  <div class="col-span-4 bg-(--recipe-block) py-1">Recipe</div>

  <p class="text-right">Voltage Tier</p>
  <div></div>
  <div class="flex justify-end"><EnergyTierWidget tier={recipe.min_tier} /></div>
  <p class="text-left"></p>

  <p class="text-right">Duration</p>
  <div></div>
  <p class="text-right">{dur.amount}</p>
  <p class="text-left">{dur.unit}</p>

  {#if recipe.eut_consumed > 0}
    <p class="text-right">Power Usage</p>
    <div></div>
    <p class="text-right">{recipe.eut_consumed}</p>
    <p class="text-left">EU/t</p>
  {/if}

  {#if recipe.eut_produced > 0}
    <p class="text-right">Power Production</p>
    <div></div>
    <p class="text-right">{recipe.eut_produced}</p>
    <p class="text-left">EU/t</p>
  {/if}
  {@render machineSettings?.()}
</div>
