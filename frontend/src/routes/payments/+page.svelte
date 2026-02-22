<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns, data } from './columns.js';
</script>

<div class="m-4 w-200">
	<DataTable {data} {columns} />
</div>
