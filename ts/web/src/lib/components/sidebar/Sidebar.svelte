<script lang="ts">
  import { calculations } from '$lib/calc/store.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import { getTextProps } from '$lib/db/recipeCategoryRepo';
  import Separator from '../ui/separator/separator.svelte';
  import IngredientIcon from '../widgets/IngredientItem/IngredientIcon.svelte';
  import { cleanAndCapitalize } from '../widgets/RecipeWidget/utils';
  import { calcUnit } from './utils';

  const itemIds = $derived(calculations.balance.map((b) => b.ingredientId));
  const items = $derived(await dbStore.data?.ingredients.getByIds(itemIds));

  const systemInput = $derived(calculations.balance.filter((i) => i.type === 'input'));
  const systemOutput = $derived(calculations.balance.filter((i) => i.type === 'output'));
  const systemRecycle = $derived(calculations.balance.filter((i) => i.type === 'recycle'));
</script>

<div class="px-4 py-4">
  <h2 class="text-lg font-semibold">Production Balance</h2>
  <p class="text-xs text-muted-foreground">Net items per second</p>
</div>

<Separator />

<div class="grid grid-cols-[3fr_auto_1fr_1fr] items-center gap-x-4 gap-y-2">
  {#if systemInput.length > 0}
    <div class="col-span-4 bg-red-800 py-1">System consumes, per second</div>
    {#each systemInput as balance}
      {@const item = items?.get(balance.ingredientId)}
      {@const { unit, amount } = calcUnit(!!item?.is_fluid, balance.value)}

      <p class="text-right text-pretty">
        {cleanAndCapitalize(item?.display_name ?? balance.ingredientId)}
      </p>
      <div class="flex items-center justify-center">
        <IngredientIcon {...getTextProps(item)} />
      </div>
      <p class="text-right">{amount}</p>
      <p class="text-left">{unit}</p>
    {/each}
  {/if}
  {#if systemOutput.length > 0}
    <div class="col-span-4 bg-green-800 py-1">System procudes, per second</div>
    {#each systemOutput as balance}
      {@const item = items?.get(balance.ingredientId)}
      {@const { unit, amount } = calcUnit(!!item?.is_fluid, balance.value)}

      <p class="text-right text-pretty">
        {cleanAndCapitalize(item?.display_name ?? balance.ingredientId)}
      </p>
      <div class="flex items-center justify-center">
        <IngredientIcon {...getTextProps(item)} />
      </div>
      <p class="text-right">{amount}</p>
      <p class="text-left">{unit}</p>
    {/each}
  {/if}
  {#if systemRecycle.length > 0}
    <div class="col-span-4 bg-blue-800 py-1">System recycles, per second</div>
    {#each systemRecycle as balance}
      {@const item = items?.get(balance.ingredientId)}
      {@const { unit, amount } = calcUnit(!!item?.is_fluid, balance.value)}

      <p class="text-right text-pretty">
        {cleanAndCapitalize(item?.display_name ?? balance.ingredientId)}
      </p>
      <div class="flex items-center justify-center">
        <IngredientIcon {...getTextProps(item)} />
      </div>
      <p class="text-right">{amount}</p>
      <p class="text-left">{unit}</p>
    {/each}
  {/if}
</div>
