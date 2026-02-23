<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import type { Ingredient } from '$lib/types/ingredient';
	import { ingredientStore } from '$lib/store/ingStore.svelte';

	const columns: ColumnDef<Ingredient>[] = [
		{
			accessorKey: 'id',
			header: 'ID',
		},
		{
			accessorKey: 'displayName',
			header: 'Name',
		},
		{
			accessorKey: 'isFluid',
			header: 'Fluid',
		},
		{
			accessorKey: 'tags',
			header: 'tags',
		},
	];
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
