import type { ColumnDef } from '@tanstack/table-core';
export type Ingredient = {
	id: string;
	displayName: string;
	isFluid: boolean;
	tags: string[];
	assetPath: string;
	sourceJar: string;
};

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
