<script lang="ts">
	import type { RecipeIngredient } from '../../../../common/types/index.js';

	type RecipeIngredienListProps = {
		items: RecipeIngredient[];
	};
	const { items }: RecipeIngredienListProps = $props();
</script>

<ul>
	{#each items as item}
		<li>{item.acceptedIds[0]} x {item.amount}</li>
	{/each}
</ul>
