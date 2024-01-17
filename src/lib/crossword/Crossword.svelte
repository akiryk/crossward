<script lang="ts">
	import CellContainer from './CellContainer.svelte';
	import type DynamicGrid from '$lib/crossword/utils/DynamicGrid';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let dynamicGrid: DynamicGrid;

	export let isEditing = false;
</script>

<table
	class="relative w-fit mb-10 table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#each dynamicGrid.cellRows as row}
		<tr class="flex justify-center flex-wrap" role="row">
			{#each row as cell}
				<CellContainer {isEditing} {cell} {dynamicGrid} />
			{/each}
		</tr>
	{/each}
</table>
