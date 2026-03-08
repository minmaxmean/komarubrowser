<script lang="ts">
  import { Handle, type HandleProps, Position } from '@xyflow/svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient';
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe';
  import { getTextProps } from '$lib/db/recipeCategoryRepo';
  import { cn } from '$lib/utils';
  import IngredientIcon from '../IngredientItem/IngredientIcon.svelte';
  import { calcChance, calcUnit, cleanAndCapitalize } from './utils';

  type RecipeIngredientWidgetProps = {
    ingredient: RecipeIngredient;
    item?: Ingredient;
    class?: ClassValue | undefined | null;
    handleType?: HandleProps['type'] | false;
  };
  const {
    ingredient: ingredient,
    item,
    class: className,
    handleType,
  }: RecipeIngredientWidgetProps = $props();
  const displayName = $derived(
    cleanAndCapitalize(item?.display_name ?? ingredient.accepted_ids[0]),
  );
  const { amount, unit } = $derived(calcUnit(!!item?.is_fluid, ingredient.amount));
  const chance = $derived(calcChance(ingredient.chance));
</script>

<div class={cn('col-span-4 grid grid-cols-subgrid relative items-center', className)}>
  {#if handleType && ingredient.chance > 0}
    <Handle
      type={handleType}
      position={handleType === 'source' ? Position.Right : Position.Left}
      id={ingredient.accepted_ids[0]}
    />
  {/if}

  <p class="text-right text-pretty">{displayName}</p>
  <IngredientIcon class="flex items-center justify-center" {...getTextProps(item)} />
  <p class="text-right">{amount}</p>
  <p class="text-left">{unit}{chance}</p>
</div>
