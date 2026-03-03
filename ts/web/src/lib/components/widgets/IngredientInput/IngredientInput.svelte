<script lang="ts">
  import CheckIcon from '@lucide/svelte/icons/check';
  import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
  import { Button } from '$lib/components/ui/button/index.js';
  import { ingredientIdFn } from '@komarubrowser/common/db/ingredient.js';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import { tick } from 'svelte';
  import { cn } from 'tailwind-variants';
  import { QueryEngine } from '../SeachWidget/search';
  import IngredientItem from '../IngredientItem/IngredientItem.svelte';
  import { scoreIngredient } from '../SeachWidget/scorers';
  import * as Command from '$lib/components/ui/command/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';

  const items = $derived((await dbStore.data?.ingredients.all()) ?? []);

  const searchEngine = $derived(new QueryEngine(items, scoreIngredient));

  let query = $state('');
  const filteredItems = $derived(searchEngine.query(query).map((val) => val.item));

  let selectedItemId = $state<string>('');
  const selectedItem = $derived(filteredItems.find((f) => ingredientIdFn(f) === selectedItemId));

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
          {#each filteredItems as item (ingredientIdFn(item))}
            <Command.Item
              value={ingredientIdFn(item)}
              onSelect={() => {
                selectedItemId = ingredientIdFn(item);
                closeAndFocusTrigger();
              }}
            >
              <IngredientItem {item} />
              <CheckIcon
                class={cn(selectedItemId !== ingredientIdFn(item) && 'text-transparent')}
              />
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
