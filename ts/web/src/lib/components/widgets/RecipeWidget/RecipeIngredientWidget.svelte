<script lang="ts">
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';
  import { calcUnit, fakeDisplayName } from './utils';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  import type { ClassValue } from 'svelte/elements';
  import { cn } from '$lib/utils';

  type RecipeIngredientWidgetProps = {
    ingredient: RecipeIngredient;
    item?: Ingredient;
    class?: ClassValue | undefined | null;
  };
  const { ingredient: ingredient, item, class: className }: RecipeIngredientWidgetProps = $props();
  const displayName = $derived(item?.display_name ?? fakeDisplayName(ingredient.accepted_ids[0]));
  const { amount, unit } = $derived(calcUnit(!!item?.is_fluid, ingredient.amount));
</script>

<div class={cn('contents', className)}>
  <p class="text-right">{displayName}</p>
  <div class="flex items-center justify-center">
    <IngredientIcon {item} />
  </div>
  <p class="text-right">{amount}</p>
  <p class="text-left">{unit}</p>
</div>
