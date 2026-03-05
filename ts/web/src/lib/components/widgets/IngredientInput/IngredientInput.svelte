<script lang="ts" generics="T">
  import { tick } from 'svelte';
  import { cn } from 'tailwind-variants';
  import X from '@lucide/svelte/icons/x';
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import { Button } from '$lib/components/ui/button/index.js';
  import { type Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import * as Command from '$lib/components/ui/command/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import type { IngredientFilter } from '$lib/db/ingredientRepo.js';
  import type { Searcher } from './search.js';
  import IngredientItem from '../IngredientItem/IngredientItem.svelte';

  type Props<T> = {
    selectedItem: T | undefined;
    search?: Searcher<T>;
    getId: (item: T) => string;
    getIngredient: (item: T) => Ingredient;
  };

  let { selectedItem = $bindable(), search, getIngredient, getId }: Props<T> = $props();

  let query = $state('');

  const filter = $derived<IngredientFilter>({
    mode: 'or',
    idLike: query.toLowerCase(),
    displayNameLike: query,
  });
  const pagination = { limit: 10, offset: 0 };
  const items = $derived(search ? search(query, filter, pagination) : null);

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => triggerRef.focus());
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
          <IngredientItem size="sm" item={getIngredient(selectedItem)} />
        {:else}
          <p>Select a item...</p>
        {/if}
        <div class="flex flex-row gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            class="size-4"
            onclick={(e) => {
              e.stopPropagation();
              selectedItem = undefined;
            }}
          >
            <X class="opacity-50" />
          </Button>
          <Button size="icon-sm" variant="ghost" class="size-4">
            <ChevronsUpDownIcon class="opacity-50" />
          </Button>
        </div>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-100 p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input placeholder="Search item..." bind:value={query} />
      <Command.List>
        <Command.Empty>No item found.</Command.Empty>
        <Command.Group value="item">
          {#each await items as item (getId(item))}
            <Command.Item
              value={getId(item)}
              onSelect={() => {
                selectedItem = item;
                closeAndFocusTrigger();
              }}
            >
              <IngredientItem item={getIngredient(item)} />
              <CheckIcon
                class={cn(
                  (!selectedItem || getId(selectedItem) !== getId(item)) && 'text-transparent',
                )}
              />
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
