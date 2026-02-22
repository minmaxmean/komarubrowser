<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns } from './columns.js';
	import { ingredientStore } from '$lib/data/ingredientStore.svelte.js';
</script>

{#if ingredientStore.status === 'loading'}
	<p>Downloadng ingredients.json...</p>
{:else if ingredientStore.status === 'error'}
	<p>Error fetching ingredients.json</p>
{:else if ingredientStore.status === 'successful'}
	<p>Loaded {ingredientStore.data.length} items.</p>
{/if}

<div class="m-4">
	<DataTable data={ingredientStore.data} {columns} />
</div>
