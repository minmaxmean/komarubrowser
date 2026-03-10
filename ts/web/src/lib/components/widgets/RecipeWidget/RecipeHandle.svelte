<script lang="ts">
  import Cross from '@lucide/svelte/icons/x';
  import { Handle, type HandleProps, Position, useStore, useSvelteFlow } from '@xyflow/svelte';
  import { Button } from '$lib/components/ui/button';

  type Props = Omit<HandleProps, 'position'> & {
    nodeId: string;
  };
  const { nodeId, ...rest }: Props = $props();

  let disabled = $state(false);
  const editable = $derived(useStore().nodesConnectable);
  $effect(() => {
    if (rest.id === 'kubejs:impure_nether_star' && rest.type === 'source') {
      $inspect(`nodeId ${nodeId} isDisabled`, disabled, 'connectable', editable, rest);
    }
  });
</script>

<Handle
  {...rest}
  class="size-max! bg-transparent!"
  position={rest.type === 'source' ? Position.Right : Position.Left}
>
  {#if rest.type === 'source' && editable}
    <Button
      size="icon-xs"
      variant={disabled ? 'additive' : 'destructive'}
      onclick={() => {
        console.log('CLICK');
        disabled = !disabled;
      }}
    >
      <Cross class="size-4 {disabled ? 'rotate-45' : 'rotate-0'}" />
    </Button>
  {/if}
</Handle>
