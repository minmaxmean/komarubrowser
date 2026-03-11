<script lang="ts">
  import Cross from '@lucide/svelte/icons/x';
  import { Handle, type HandleProps, Position, useStore } from '@xyflow/svelte';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { Button } from '$lib/components/ui/button';

  type Props = Omit<HandleProps, 'position' | 'id'> & {
    id: string;
    nodeId: string;
  };
  const { nodeId, id, ...rest }: Props = $props();

  const disabled = $derived(appState.isEdgeDisabled(nodeId, id));
  const editable = $derived(useStore().nodesConnectable);
</script>

<Handle
  {...rest}
  {id}
  class="size-max! bg-transparent!"
  position={rest.type === 'source' ? Position.Right : Position.Left}
>
  {#if rest.type === 'source' && editable}
    <Button
      size="icon-xs"
      variant={disabled ? 'additive' : 'destructive'}
      onclick={() => appState.toggleEdge(nodeId, id)}
    >
      <Cross class="size-4 {disabled ? 'rotate-45' : 'rotate-0'}" />
    </Button>
  {/if}
</Handle>
