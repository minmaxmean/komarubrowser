<script lang="ts">
  import Manual from '@lucide/svelte/icons/user';
  import Wand from '@lucide/svelte/icons/wand-sparkles';
  import { type NodeProps } from '@xyflow/svelte';
  import Fraction from 'fraction.js';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { calculations } from '$lib/calc/store.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import Input from '$lib/components/ui/input/input.svelte';
  import EnergyTierInput from '../EnergyTier/EnergyTierInput.svelte';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import { timeUnit } from '../RecipeWidget/utils';
  import type { RecipeNodeType } from './graph';

  const { id, data }: NodeProps<RecipeNodeType> = $props();
  const { recipe } = $derived(data);
  const dur = $derived(timeUnit(calculations.effetiveDuration(id) ?? 0, true));
  const isAuto = $derived(appState.getIsAuto(id));
</script>

<RecipeWidget {recipe} withHandles>
  {#snippet machineSettings()}
    <div class="col-span-4 bg-(--machine-block) py-1 my-2">Machine</div>

    <p class="text-right"># Machines</p>
    <Input
      disabled={isAuto}
      class="text-right col-span-2"
      bind:value={
        () => calculations.machineCnt(id).toString(),
        (newVal) => appState.setMachineCnt(id, new Fraction(newVal))
      }
    />
    <Button
      size="icon-sm"
      variant="ghost"
      class="hover:bg-muted"
      onclick={() => appState.toggleIsAuto(id)}
    >
      {#if isAuto}
        <Wand class="opacity-50" />
      {:else}
        <Manual class="opacity-50" />
      {/if}
    </Button>

    <p class="text-right">Machine Tier</p>
    <EnergyTierInput
      class="text-right col-span-2"
      minTier={recipe.min_tier}
      bind:value={
        () => appState.getMachineTier(id) ?? recipe.min_tier,
        (newVal) => appState.setMachineTier(id, newVal)
      }
    />
    <p></p>

    <p class="text-right">Has Perfect OC</p>
    <div class="flex flex-row justify-end col-span-2">
      <Checkbox
        bind:checked={
          () => appState.getPerfectOC(id) ?? false, (newVal) => appState.setPerfectOC(id, newVal)
        }
      />
    </div>
    <p></p>

    <p class="text-right">Effective Duration</p>
    <div></div>
    <p class="text-right">{dur.amount}</p>
    <p class="text-left">{dur.unit}</p>
  {/snippet}
</RecipeWidget>
