<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import type { ItemSize } from '$lib/components/ui/item/item.svelte';
	import { type Ingredient } from '$lib/data/ingredient';
	import IngredientIcon from './IngredientIcon.svelte';

	type Props = { ingredient: Ingredient; size?: ItemSize };

	const { ingredient, size }: Props = $props();
</script>

<Item.Root {size} class="w-full p-2">
	<Item.Media>
		<IngredientIcon {size} {ingredient} />
	</Item.Media>
	<Item.Content class="gap-0.5">
		<Item.Title>{ingredient.displayName}</Item.Title>
		{#if size != 'sm'}
			<Item.Description>{ingredient.id}</Item.Description>
		{/if}
	</Item.Content>
</Item.Root>
