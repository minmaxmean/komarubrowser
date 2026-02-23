<script lang="ts">
	import { ingredientUrl, type Ingredient } from '$lib/types/ingredient';
	import { iconVariants, type IconVariants } from './iconVariants';

	type Props = { item: Ingredient } & IconVariants;

	const { item, size }: Props = $props();

	const iconURL = $derived(ingredientUrl(item));
</script>

<img src={iconURL} class={iconVariants({ size })} alt={item.displayName} />
