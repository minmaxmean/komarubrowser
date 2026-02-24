<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import type { ItemSize } from '$lib/components/ui/item/item.svelte';
	import type { Ingredient } from '@komarubrowser/common/types';
	import IngredientIcon from './IngredientIcon.svelte';

	type Props = { item: Ingredient; size?: ItemSize };

	const { item: item, size }: Props = $props();
</script>

<Item.Root {size} class="w-full p-2">
	<Item.Media>
		<IngredientIcon {size} {item} />
	</Item.Media>
	<Item.Content class="gap-0.5">
		<Item.Title>{item.displayName}</Item.Title>
		{#if size != 'sm'}
			<Item.Description>{item.id}</Item.Description>
		{/if}
	</Item.Content>
</Item.Root>
