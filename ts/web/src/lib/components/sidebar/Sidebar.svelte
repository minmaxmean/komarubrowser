<script lang="ts">
  import { calculations } from '$lib/calc/store.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import ScrollArea from '../ui/scroll-area/scroll-area.svelte';
  import Separator from '../ui/separator/separator.svelte';
  import BalanceList from './BalanceList.svelte';

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

<ScrollArea class="contents" orientation="vertical">
  <div class="grid grid-cols-[3fr_auto_1fr_1fr] items-center gap-x-4 gap-y-2">
    {#if systemInput.length > 0}
      <BalanceList variant="consumes" balances={systemInput} {items} />
    {/if}
    {#if systemOutput.length > 0}
      <BalanceList variant="produces" balances={systemOutput} {items} />
    {/if}
    {#if systemRecycle.length > 0}
      <BalanceList variant="recycles" balances={systemRecycle} {items} />
    {/if}
  </div>
</ScrollArea>
