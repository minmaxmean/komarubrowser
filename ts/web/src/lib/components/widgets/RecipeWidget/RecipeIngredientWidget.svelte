<script lang="ts">
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';
  import { calcUnit, fakeDisplayName } from './utils';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';

  type RecipeIngredientWidgetProps = {
    ingredient: RecipeIngredient;
    item?: Ingredient;
  };
  const { ingredient: ingredient, item }: RecipeIngredientWidgetProps = $props();
  const displayName = $derived(item?.display_name ?? fakeDisplayName(ingredient.accepted_ids[0]));
  const { amount, unit } = $derived(calcUnit(!!item?.is_fluid, ingredient.amount));
</script>

<div class="flex flex-row items-center gap-2">
  <div class="flex flex-2 flex-row items-center justify-end gap-2 text-right">
    <p>{displayName}</p>
    <IngredientIcon {item} />
  </div>
  <p class="flex-1 text-right">{amount}</p>
  <p class="flex-1 text-left">{unit}</p>
</div>
