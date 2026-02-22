<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { ingredientStore } from '$lib/data/ingredientStore.svelte';
	import IngredientItem from '../IngredientItem/IngredientItem.svelte';
	import { filterByQuery } from './search';

	let query = $state('');
	$inspect(query, 'query');
	const scoredItems = $derived(filterByQuery(ingredientStore.data, query));
	// $inspect(scoredItems.length, 'scoredItems.length');
	// $inspect(scoredItems.slice(0, 3), 'scoredItems[0:3]');
	const items = $derived(scoredItems.map((val) => val.item));
	// $inspect(ingredientStore.data, 'ingredientStore.data');

	let open = $state(false);
	let selectedItemId = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedItem = $derived(items.find((f) => f.id === selectedItemId));

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
					<IngredientItem size="sm" ingredient={selectedItem} />
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
					{#each items as item (item.id)}
						<Command.Item
							value={item.id}
							keywords={[item.displayName]}
							onSelect={() => {
								selectedItemId = item.id;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn(selectedItemId !== item.id && 'text-transparent')} />
							<IngredientItem ingredient={item} />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
