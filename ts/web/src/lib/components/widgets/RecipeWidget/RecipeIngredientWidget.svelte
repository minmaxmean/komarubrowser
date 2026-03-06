<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';
  import { getTextProps } from '$lib/db/recipeCategoryRepo';
  import { cn } from '$lib/utils';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import { calcChance, calcUnit, fakeDisplayName } from './utils';

  type RecipeIngredientWidgetProps = {
    ingredient: RecipeIngredient;
    item?: Ingredient;
    class?: ClassValue | undefined | null;
  };
  const { ingredient: ingredient, item, class: className }: RecipeIngredientWidgetProps = $props();
  const displayName = $derived(item?.display_name ?? fakeDisplayName(ingredient.accepted_ids[0]));
  const { amount, unit } = $derived(calcUnit(!!item?.is_fluid, ingredient.amount));
  const chance = $derived(calcChance(ingredient.chance));
</script>

<div class={cn('contents', className)}>
  <p class="text-right text-pretty">{displayName}</p>
  <div class="flex items-center justify-center">
    <IngredientIcon {...getTextProps(item)} />
  </div>
  <p class="text-right">{amount}</p>
  <p class="text-left">{unit}{chance}</p>
</div>
