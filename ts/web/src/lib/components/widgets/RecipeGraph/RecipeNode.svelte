<script lang="ts">
  import Manual from '@lucide/svelte/icons/user';
  import Wand from '@lucide/svelte/icons/wand-sparkles';
  import { type NodeProps } from '@xyflow/svelte';
  import Fraction from 'fraction.js';
  import { Button } from '$lib/components/ui/button';
  import Input from '$lib/components/ui/input/input.svelte';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import { useCustoms } from './customs';
  import type { RecipeNodeType } from './graph';

  const { id, data }: NodeProps<RecipeNodeType> = $props();
  const { calcSettings, recipe, calcResult } = $derived(data);
  const { toggleManual, setMachineCnt } = useCustoms();
  const machineCnt = $derived(new Fraction(calcResult ?? 0).toString());
</script>

<RecipeWidget {recipe} withHandles>
  {#snippet machineSettings()}
    <div class="col-span-4 bg-(--machine-block) py-1 my-2">Machine</div>
    <div></div>
    <Input
      disabled={calcSettings.isAuto}
      class="text-right col-span-2"
      value={machineCnt}
      onchange={(e) => {
        const newVal = new Fraction(e.currentTarget.value);
        setMachineCnt(id, newVal);
      }}
    />
    <Button size="icon-sm" variant="ghost" class="hover:bg-muted" onclick={() => toggleManual(id)}>
      {#if calcSettings.isAuto}
        <Wand class="opacity-50" />
      {:else}
        <Manual class="opacity-50" />
      {/if}
    </Button>
  {/snippet}
</RecipeWidget>
