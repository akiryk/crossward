<script lang="ts">
	import CellContainer from './CellContainer.svelte';
	import type { DynamicCell, DynamicGrid } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	import { get } from 'svelte/store';
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let grid: DynamicGrid;
	export let isEditing = false;

	// The cell parameter is a cell with some updated properties
	export const handleUpdateCell = (cell: DynamicCell) => {
		// handle symmetry index 24, id 4:4
		const symmetricalCell = grid.cellMap['4:4'];
		const symmetricalCellIndex = 24;
		cell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		symmetricalCell.isSymmetrical = !!cell.value || !!symmetricalCell.value;

		grid.cellMap[cell.id] = cell;
		grid.cellMap[symmetricalCell.id] = symmetricalCell;
		const index = cell.x + cell.y * 5;
		grid.cellsArray[index] = cell;
		grid.cellsArray[symmetricalCellIndex] = symmetricalCell;
		grid.cellRows[cell.y][cell.x] = cell;
		grid.cellRows[symmetricalCell.y][symmetricalCell.x] = symmetricalCell;

		PuzzleStore.set(grid);
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
