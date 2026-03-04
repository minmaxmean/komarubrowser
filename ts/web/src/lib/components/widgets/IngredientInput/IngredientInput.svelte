<script lang="ts">
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import { Button } from '$lib/components/ui/button/index.js';
  import { type Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import { tick } from 'svelte';
  import { cn } from 'tailwind-variants';
  import IngredientItem from '../IngredientItem/IngredientItem.svelte';
  import * as Command from '$lib/components/ui/command/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import type { Pagination } from '@komarubrowser/common/db/common';

  type Props = {
    selectedItem: Ingredient | undefined;
    search: (query: string, pagination: Pagination) => Promise<Ingredient[]>;
  };

  let { selectedItem = $bindable(), search }: Props = $props();

  let query = $state('');

  const items = $derived(search(query, { limit: 10, offset: 0 }));

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        class="w-100 justify-between"
        role="combobox"
        aria-expanded={open}
      >
        {#if selectedItem}
          <IngredientItem size="sm" item={selectedItem} />
        {:else}
          Select a item...
        {/if}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-100 p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input placeholder="Search item..." bind:value={query} />
      <Command.List>
        <Command.Empty>No item found.</Command.Empty>
        <Command.Group value="item">
          {#each await items as item (item.id)}
            <Command.Item
              value={item.id}
              onSelect={() => {
                selectedItem = item;
                closeAndFocusTrigger();
              }}
            >
              <IngredientItem {item} />
              <CheckIcon class={cn(selectedItem?.id !== item.id && 'text-transparent')} />
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
