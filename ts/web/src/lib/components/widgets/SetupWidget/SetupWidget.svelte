<script>
  import Trash from '@lucide/svelte/icons/Trash';
  import Copy from '@lucide/svelte/icons/copy';
  import Edit from '@lucide/svelte/icons/pencil';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import * as Select from '$lib/components/ui/select/index.js';

  const selections = $derived(appState.setups.list());
  const current = $derived(appState.setups.current());
  $inspect(current, selections);
</script>

<ButtonGroup.Root class="w-full rounded-md border border-input text-pretty">
  <Select.Root
    type="single"
    bind:value={() => current, (newValue) => appState.setups.change(newValue)}
  >
    <Select.Trigger class="w-full border-none">
      {current}
    </Select.Trigger>
    <Select.Content>
      {#each selections as setup}
        <Select.Item value={setup} label={setup}>
          {setup}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  <Button variant="secondary" size="icon" class="hover:bg-background">
    <Edit />
  </Button>
  <Button
    variant="secondary"
    size="icon"
    class="hover:bg-background"
    onclick={() => appState.setups.duplicate()}
  >
    <Copy />
  </Button>
  <Button
    variant="secondary"
    size="icon"
    class="hover:bg-(--input-block)"
    onclick={() => appState.setups.deleteCurrent()}
  >
    <Trash />
  </Button>
</ButtonGroup.Root>
