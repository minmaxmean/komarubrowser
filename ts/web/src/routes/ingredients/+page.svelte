<script lang="ts">
  import type { ColumnDef } from '@tanstack/table-core';
  import type { Ingredient } from '@komarubrowser/common/db/ingredient.js';
  import DataTable from '$lib/components/ui/data-table/data-table.svelte';
  import { dbStore, globalFilter } from '$lib/db/dbStore.svelte';

  const columns: ColumnDef<Ingredient>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'display_name',
      header: 'Name',
    },
    {
      accessorKey: 'is_fluid',
      header: 'Fluid',
    },
    {
      accessorKey: 'tags',
      header: 'tags',
    },
  ];
  const ingrediets = $derived(await dbStore.data?.ingredients.all());
  // $inspect({ globalFilter, ingrediets });
</script>

{#if dbStore.status === 'loading'}
  <p>Downloadng ingredients.json...</p>
{:else if dbStore.status === 'error'}
  <p>Error fetching ingredients.json</p>
{/if}

<div class="m-4">
  <DataTable data={ingrediets ?? []} {columns} />
</div>
