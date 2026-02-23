<script lang="ts" generics="I">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick, type Snippet } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { QueryEngine } from './search';
	import type { ScorerFn } from './scorers';

	type Props = {
		items: I[];
		scorerFn: ScorerFn<I>;
		idFn: (item: I) => string;
		children: Snippet<[I]>;
		row: Snippet<[I]>;
	};

	const { items: items, scorerFn, idFn, children, row }: Props = $props();
	const searchEngine = $derived(new QueryEngine(items, scorerFn));

	let query = $state('');
	const filteredItems = $derived(searchEngine.query(query).map((val) => val.item));

	let selectedItemId = $state<string>('');
	const selectedItem = $derived(filteredItems.find((f) => idFn(f) === selectedItemId));

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
					{@render children(selectedItem)}
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
					{#each filteredItems as item (idFn(item))}
						<Command.Item
							value={idFn(item)}
							onSelect={() => {
								selectedItemId = idFn(item);
								closeAndFocusTrigger();
							}}
						>
							{@render row(item)}
							<CheckIcon class={cn(selectedItemId !== idFn(item) && 'text-transparent')} />
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
