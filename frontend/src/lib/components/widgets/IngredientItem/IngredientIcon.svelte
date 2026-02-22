<script lang="ts">
	import { ingredientUrl, type Ingredient } from '$lib/data/ingredient';
	import { iconVariants, type IconVariants } from './iconVariants';

	type Props = { ingredient: Ingredient } & IconVariants;

	const { ingredient, size }: Props = $props();

	const iconURL = $derived(ingredientUrl(ingredient));
</script>

<img src={iconURL} class={iconVariants({ size })} alt={ingredient.displayName} />
