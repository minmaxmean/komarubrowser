<script lang="ts">
	import { recipeStore } from '$lib/data/recipeStore.svelte.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { createColumnHelper, type ColumnDef } from '@tanstack/table-core';
	import type { Recipe } from '$lib/data/recipe';
	import { renderComponent } from '$lib/components/ui/data-table';
	import RecipeIngredientList from './RecipeIngredientList.svelte';
	import EnergyTierWidget from '$lib/components/widgets/EnergyTier/EnergyTierWidget.svelte';

	const columnHelper = createColumnHelper<Recipe>();

	const columns: ColumnDef<Recipe, any>[] = [
		columnHelper.accessor('id', { header: 'Recipe ID' }),
		columnHelper.accessor('machine', { header: 'Machine' }),
		columnHelper.accessor('inputs', {
			header: 'Inputs',
			cell: (info) => renderComponent(RecipeIngredientList, { items: info.getValue() }),
		}),
		columnHelper.accessor('outputs', {
			header: 'Outputs',
			cell: (info) => renderComponent(RecipeIngredientList, { items: info.getValue() }),
		}),
		columnHelper.accessor('duration', {
			header: 'Duration',
			cell: (info) => `${info.getValue() / 20}s`,
		}),
		columnHelper.accessor('minTier', {
			header: 'Tier',
			cell: (info) => renderComponent(EnergyTierWidget, { tier: info.getValue() }),
		}),
	];
</script>

{#if recipeStore.status === 'loading'}
	<p>Downloadng recipes.json...</p>
{:else if recipeStore.status === 'error'}
	<p>Error fetching recipes.json</p>
{:else if recipeStore.status === 'successful'}
	<p>Loaded {recipeStore.data.length} items.</p>
{/if}

<div class="m-4">
	<DataTable data={recipeStore.data} {columns} />
</div>
