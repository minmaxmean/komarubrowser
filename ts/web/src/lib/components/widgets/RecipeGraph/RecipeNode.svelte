<script lang="ts">
  import Manual from '@lucide/svelte/icons/user';
  import Wand from '@lucide/svelte/icons/wand-sparkles';
  import { type NodeProps, useSvelteFlow } from '@xyflow/svelte';
  import { Button } from '$lib/components/ui/button';
  import RecipeWidget from '../RecipeWidget/RecipeWidget.svelte';
  import type { NodeType, RecipeNodeType } from './graph';

  const { id, data }: NodeProps<RecipeNodeType> = $props();
  const { calcState, recipe } = $derived(data);
  const { updateNodeData } = useSvelteFlow<NodeType>();
</script>

<RecipeWidget {recipe} withHandles>
  {#snippet machineSettings()}
    <div class="col-span-4 bg-sky-800 py-1">Machine</div>

    <p class="text-right"># of machines</p>
    <div></div>
    <p class="text-right">{calcState.machineCnt ?? 0}</p>
    <Button
      size="icon-sm"
      variant="ghost"
      class="hover:bg-muted"
      onclick={() => updateNodeData(id, { calcState: { isAuto: !calcState.isAuto } })}
    >
      {#if calcState.isAuto}
        <Wand class="opacity-50" />
      {:else}
        <Manual class="opacity-50" />
      {/if}
    </Button>
  {/snippet}
</RecipeWidget>
