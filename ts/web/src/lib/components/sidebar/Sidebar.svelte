<script lang="ts">
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { calculations } from '$lib/calc/store.svelte';
  import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
  import Separator from '$lib/components/ui/separator/separator.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import SetupWidget from '../widgets/SetupWidget/SetupWidget.svelte';
  import BalanceList from './BalanceList.svelte';

  const itemIds = $derived(calculations.balance.map((b) => b.ingredientId));
  const items = $derived(dbStore.data?.ingredients.getByIds(itemIds));

  const systemInput = $derived(calculations.balance.filter((i) => i.type === 'input'));
  const systemOutput = $derived(calculations.balance.filter((i) => i.type === 'output'));
  const systemRecycle = $derived(calculations.balance.filter((i) => i.type === 'recycle'));
</script>

<div class="px-4 py-4">
  <SetupWidget />
</div>

{#if calculations.errorMsg}
  <Separator />
  <div class="relative items-center text-sm grid grid-cols-[4_1fr] gap-4 p-4 text-pretty">
    <AlertCircleIcon />
    <p class="col-start-2">{calculations.errorMsg}</p>
    <p class="col-start-2">
      Usually this means that you need to manually set number of machines for more recipies.
    </p>
    <p class="col-start-2">{calculations.badMachinesStr()}</p>
  </div>
{/if}

<ScrollArea class="contents" orientation="vertical">
  <div class="grid grid-cols-[3fr_auto_1fr_1fr] items-center gap-x-4 gap-y-2">
    {#if systemInput.length > 0}
      <BalanceList variant="consumes" balances={systemInput} items={await items} />
    {/if}
    {#if systemOutput.length > 0}
      <BalanceList variant="produces" balances={systemOutput} items={await items} />
    {/if}
    {#if systemRecycle.length > 0}
      <BalanceList variant="recycles" balances={systemRecycle} items={await items} />
    {/if}
  </div>
</ScrollArea>
