<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns, type Ingredient } from './columns.js';
	import { onMount } from 'svelte';

	let jsonData: Ingredient[] = $state([]);
	let status = $state('idle');

	onMount(async () => {
		status = 'loading';
		try {
			const res = await fetch('/assets/dump/ingredients.min.json');
			jsonData = await res.json();
			status = 'success';
		} catch (e) {
			console.error(e);
			status = 'error';
		}
	});
</script>

{#if status === 'loading'}
	<p>Downloadng ingredients.json...</p>
{:else if status === 'error'}
	<p>Error fetching ingredients.json</p>
{:else if status === 'success'}
	<p>Loaded {jsonData.length} items.</p>
{/if}

<div class="m-4">
	<DataTable data={jsonData} {columns} />
</div>
