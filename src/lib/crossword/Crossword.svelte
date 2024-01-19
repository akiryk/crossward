<script lang="ts">
	import { get } from 'svelte/store';
	import CellContainer from './CellContainer.svelte';
	import type { DynamicCell, DynamicGrid, Puzzle } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let grid: DynamicGrid;
	export let isEditing = false;

	export const handleUpdateCell = (cell: DynamicCell) => {
		if (grid) {
			grid.cellMap[cell.id] = cell;
			const index = cell.x + cell.y * 5;
			grid.cellsArray[index] = cell;
			grid.cellRows[cell.y][cell.x] = cell;
			PuzzleStore.set(grid);
			console.log(grid.cellsArray);
		}
	};
</script>

<table
	class="relative w-fit mb-10 table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#if grid}
		{#each grid.cellRows as row}
			<tr class="flex justify-center flex-wrap" role="row">
				{#each row as cell}
					<CellContainer {isEditing} {cell} updateCell={handleUpdateCell} />
				{/each}
			</tr>
		{/each}
	{/if}
</table>
