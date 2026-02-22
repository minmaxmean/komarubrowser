import type { Ingredient } from '$lib/data/ingredient';
import type { ColumnDef } from '@tanstack/table-core';

export const columns: ColumnDef<Ingredient>[] = [
	{
		accessorKey: 'id',
		header: 'ID'
	},
	{
		accessorKey: 'displayName',
		header: 'Name'
	},
	{
		accessorKey: 'isFluid',
		header: 'Fluid'
	},
	{
		accessorKey: 'tags',
		header: 'tags'
	}
];
