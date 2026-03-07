<script lang="ts">
  import Manual from '@lucide/svelte/icons/user';
  import Wand from '@lucide/svelte/icons/wand-sparkles';
  import { type NodeProps } from '@xyflow/svelte';
  import Fraction from 'fraction.js';
  import { Button } from '$lib/components/ui/button';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import { useCustoms } from './customs';
  import type { RecipeNodeType } from './graph';

  const { id, data }: NodeProps<RecipeNodeType> = $props();
  const { calcSettings, recipe } = $derived(data);
  const { toggleManual } = useCustoms();
</script>

<RecipeWidget {recipe} withHandles>
  {#snippet machineSettings()}
    <div class="col-span-4 bg-(--machine-block) py-1">Machine</div>

    <p class="text-right"># of machines</p>
    <div></div>
    <p class="text-right">{new Fraction(calcSettings.machineCnt ?? 0)}</p>
    <Button size="icon-sm" variant="ghost" class="hover:bg-muted" onclick={() => toggleManual(id)}>
      {#if calcSettings.isAuto}
        <Wand class="opacity-50" />
      {:else}
        <Manual class="opacity-50" />
      {/if}
    </Button>
  {/snippet}
</RecipeWidget>
