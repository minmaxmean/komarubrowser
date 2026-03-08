<script lang="ts">
  import Trash from '@lucide/svelte/icons/Trash';
  import Copy from '@lucide/svelte/icons/copy';
  import Edit from '@lucide/svelte/icons/pencil';
  import type { KeyboardEventHandler } from 'svelte/elements';
  import { appState } from '$lib/appstate/app_state.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
  import Input from '$lib/components/ui/input/input.svelte';
  import * as Select from '$lib/components/ui/select/index.js';

  const selections = $derived(appState.setups.list());
  const current = $derived(appState.setups.current());

  let isEditing = $state(false);
  let editValue = $state('');
  let editRef = $state<HTMLInputElement | null>(null);

  const startEdit = () => {
    editValue = current;
    isEditing = true;
  };
  const cancelEdit = () => {
    isEditing = false;
  };
  const commitEdit = () => {
    if (editValue.trim() && editValue !== current) {
      appState.setups.rename(editValue);
    }
    isEditing = false;
  };
  const handleKey: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') commitEdit();
    else if (e.key === 'Escape') cancelEdit();
  };
  $effect(() => {
    if (isEditing && editRef) editRef.focus();
  });
</script>

<ButtonGroup.Root class="w-full rounded-md border border-input text-pretty">
  {#if isEditing}
    <Input bind:value={editValue} bind:ref={editRef} class="border-none" onkeydown={handleKey} />
  {:else}
    <Select.Root
      type="single"
      bind:value={() => current, (newValue) => appState.setups.change(newValue)}
      disabled={isEditing}
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
  {/if}
  <Button
    variant="secondary"
    size="icon"
    class="hover:bg-background data-[editing=true]:bg-yellow-800"
    data-editing={isEditing}
    onclick={isEditing ? cancelEdit : startEdit}
  >
    <Edit />
  </Button>
  <Button
    variant="secondary"
    size="icon"
    class="hover:bg-background"
    disabled={isEditing}
    onclick={() => appState.setups.duplicate()}
  >
    <Copy />
  </Button>
  <Button
    variant="secondary"
    size="icon"
    class="hover:bg-(--input-block)"
    disabled={isEditing}
    onclick={() => appState.setups.deleteCurrent()}
  >
    <Trash />
  </Button>
</ButtonGroup.Root>
