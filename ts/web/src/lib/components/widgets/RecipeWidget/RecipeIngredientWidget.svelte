<script lang="ts">
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';
  import { fakeDisplayName } from './utils';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';

  type RecipeIngredientWidgetProps = {
    ingredient: RecipeIngredient;
    item?: Ingredient;
  };
  const { ingredient: ingredient, item }: RecipeIngredientWidgetProps = $props();
  const displayName = $derived(item?.display_name ?? fakeDisplayName(ingredient.accepted_ids[0]));
  const amount = $derived(item?.is_fluid ? ingredient.amount / 1000 : ingredient.amount);

  const unit = $derived(item?.is_fluid ? 'b' : '');
</script>

<div class="flex flex-row gap-2">
  <div class="flex flex-2 flex-row justify-end gap-2 text-right">
    <p>{displayName}</p>
    <IngredientIcon {item} />
  </div>
  <p class="flex-1 text-right">{amount}</p>
  <p class="flex-1 text-left">{unit}</p>
</div>
