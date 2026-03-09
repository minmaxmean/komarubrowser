<script lang="ts">
  import { Handle, type HandleProps, Position } from '@xyflow/svelte';
  import type { ClassValue } from 'svelte/elements';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import type { RecipeIngredient } from '@komarubrowser/common/db/recipe.js';
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
  const displayName = $derived(cleanAndCapitalize(item?.display_name ?? ingredient.i));
  const { amount, unit } = $derived(calcUnit(!!item?.is_fluid, ingredient.a));
  const chance = $derived(calcChance(ingredient.c));
</script>

<div class={cn('col-span-4 grid grid-cols-subgrid relative items-center', className)}>
  {#if handleType && (!ingredient.c || ingredient.c > 0)}
    <Handle
      type={handleType}
      position={handleType === 'source' ? Position.Right : Position.Left}
      id={ingredient.i}
    />
  {/if}

  <p class="text-right text-pretty">{displayName}</p>
  <IngredientIcon class="flex items-center justify-center" {...getTextProps(item)} />
  <p class="text-right">{amount}</p>
  <p class="text-left">{unit}{chance}</p>
</div>
