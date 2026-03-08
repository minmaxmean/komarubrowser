<script lang="ts">
  import Manual from '@lucide/svelte/icons/user';
  import Wand from '@lucide/svelte/icons/wand-sparkles';
  import { type NodeProps } from '@xyflow/svelte';
  import Fraction from 'fraction.js';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { calculations } from '$lib/calc/store.svelte';
  import { Button } from '$lib/components/ui/button';
  import Input from '$lib/components/ui/input/input.svelte';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import type { RecipeNodeType } from './graph';

  const { id, data }: NodeProps<RecipeNodeType> = $props();
  const { recipe } = $derived(data);
  const machineCnt = $derived(new Fraction(calculations.machineCnt(id) ?? 0).toString());
</script>

<RecipeWidget {recipe} withHandles>
  {#snippet machineSettings()}
    <div class="col-span-4 bg-(--machine-block) py-1 my-2">Machine</div>
    <div></div>
    <Input
      disabled={appState.isAuto(id)}
      class="text-right col-span-2"
      value={machineCnt}
      onchange={(e) => {
        const newVal = new Fraction(e.currentTarget.value);
        appState.setMachineCnt(id, newVal);
      }}
    />
    <Button
      size="icon-sm"
      variant="ghost"
      class="hover:bg-muted"
      onclick={() => appState.toggleManual(id)}
    >
      {#if appState.isAuto(id)}
        <Wand class="opacity-50" />
      {:else}
        <Manual class="opacity-50" />
      {/if}
    </Button>
  {/snippet}
</RecipeWidget>
