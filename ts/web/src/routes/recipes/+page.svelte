<script lang="ts">
  import { type ColumnDef, createColumnHelper } from '@tanstack/table-core';
  import type { Recipe } from '@komarubrowser/common/db/recipe.js';
  import { renderComponent } from '$lib/components/ui/data-table';
  import DataTable from '$lib/components/ui/data-table/data-table.svelte';
  import EnergyTierWidget from '$lib/components/widgets/EnergyTier/EnergyTierWidget.svelte';
  import { dbStore } from '$lib/db/dbStore.svelte';
  import RecipeIngredientList from './RecipeIngredientList.svelte';

  const columnHelper = createColumnHelper<Recipe>();

  const columns: ColumnDef<Recipe, any>[] = [
    columnHelper.accessor('id', { header: 'Recipe ID' }),
    columnHelper.accessor('recipe_type', { header: 'Recipe Type' }),
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
    columnHelper.accessor('min_tier', {
      header: 'Tier',
      cell: (info) => renderComponent(EnergyTierWidget, { tier: info.getValue() }),
    }),
  ];
  const recipiesPromise = $derived(dbStore.data?.recipe.all());
  const recipes = $derived(await recipiesPromise);
</script>

<div class="m-4">
  <DataTable data={recipes ?? []} {columns} />
</div>
