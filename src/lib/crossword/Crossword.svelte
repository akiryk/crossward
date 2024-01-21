<script lang="ts">
	import CellContainer from './CellContainer.svelte';
	import { type DynamicCell, type DynamicGrid, type Coords, Direction } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	import { getSymmetricalCell, getIdFromCoords } from './utils/crosswordHelpers';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let grid: DynamicGrid;
	export let isEditing = false;

	// The cell parameter is a cell with some updated properties
	export function updateCellSymmetry(cell: DynamicCell) {
		const symmetricalCell = getSymmetricalCell(grid, { x: cell.x, y: cell.y });
		const symmetricalCellIndex = symmetricalCell.index;
		cell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		symmetricalCell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		grid.cellMap[cell.id] = cell;
		grid.cellMap[symmetricalCell.id] = symmetricalCell;
		grid.cellsArray[cell.index] = cell;
		grid.cellsArray[symmetricalCellIndex] = symmetricalCell;
		grid.cellRows[cell.y][cell.x] = cell;
		grid.cellRows[symmetricalCell.y][symmetricalCell.x] = symmetricalCell;
		PuzzleStore.set(grid);
	}

	export function getCellAbove(x: number, y: number): Coords {
		let newY = y - 1;
		let newX = x; // row = y
		if (newY < 0) {
			newY = grid.downSpan - 1;
			newX = x - 1 < 0 ? grid.acrossSpan - 1 : x - 1;
		}
		return { x: newX, y: newY };
	}
	export function getCellBelow(x: number, y: number): Coords {
		let newY = y + 1;
		let newX = x; // row = y
		if (newY >= grid.downSpan) {
			newY = 0;
			newX = x + 1 >= grid.acrossSpan ? 0 : x + 1;
		}
		return { x: newX, y: newY };
	}
	export function getCellToTheLeft(x: number, y: number): Coords {
		let newX = x - 1; // column = x
		let newY = y; // row = y
		if (newX < 0) {
			newX = grid.acrossSpan - 1;
			newY = y - 1 < 0 ? grid.downSpan - 1 : y - 1;
		}
		return { x: newX, y: newY };
	}
	export function getCellToTheRight(x: number, y: number): Coords {
		let newX = x + 1; // column = x
		let newY = y; // row = y
		if (newX >= grid.acrossSpan) {
			newX = 0;
			newY = y + 1 === grid.downSpan ? 0 : y + 1;
		}
		// const nextCell = grid.cellMap[`${newX}:${newY}`];
		// while (shouldSkipNextCell(possibleNextCell, overrideDirectionMode)) {
		// 	return getCellToTheRight({
		// 		currentRow: newY,
		// 		currentColumn: newX
		// 	});
		// }
		return { x: newX, y: newY };
	}

	export function gridGoToNextCell(cell: DynamicCell, direction: Direction) {
		let nextCellFunction: (x: number, y: number) => Coords;
		switch (direction) {
			case Direction.GO_RIGHT:
				nextCellFunction = getCellToTheRight;
				break;
			case Direction.GO_DOWN:
				nextCellFunction = getCellBelow;
				break;
			case Direction.GO_UP:
				nextCellFunction = getCellAbove;
				break;
			case Direction.GO_LEFT:
				nextCellFunction = getCellToTheLeft;
				break;
			default:
				nextCellFunction = getCellToTheRight;
		}
		// remove focus from current cell
		const id = cell.id;
		grid.cellMap[id].cellHasFocus = false;
		const index = grid.cellMap[id].index;
		grid.cellsArray[index].cellHasFocus = false;
		grid.cellRows[cell.y][cell.x].cellHasFocus = false;
		const nextCellCoords = nextCellFunction(cell.x, cell.y);
		updateCellWithFocus(nextCellCoords);
	}

	export function gridGoToNextCell2(cell: DynamicCell, direction: Direction) {
		let nextCellFunction: (x: number, y: number) => Coords;
		switch (direction) {
			case Direction.GO_RIGHT:
				nextCellFunction = getCellToTheRight;
				break;
			case Direction.GO_DOWN:
				nextCellFunction = getCellBelow;
				break;
			case Direction.GO_UP:
				nextCellFunction = getCellAbove;
				break;
			case Direction.GO_LEFT:
				nextCellFunction = getCellToTheLeft;
				break;
			default:
				nextCellFunction = getCellToTheRight;
		}
		// remove focus from current cell
		const id = cell.id;
		grid.cellMap[id].cellHasFocus = false;
		const index = grid.cellMap[id].index;
		grid.cellsArray[index].cellHasFocus = false;
		grid.cellRows[cell.y][cell.x].cellHasFocus = false;
		const nextCellCoords = nextCellFunction(cell.x, cell.y);
		console.log('hi');
		updateCellWithFocus(nextCellCoords);
	}

	function updateCellWithFocus(coords: Coords) {
		const id = getIdFromCoords(coords);
		const { x, y } = coords;
		grid.cellMap[id].cellHasFocus = true;
		const index = grid.cellMap[id].index;
		grid.cellsArray[index].cellHasFocus = true;
		grid.cellRows[y][x].cellHasFocus = true;
		PuzzleStore.set(grid);
	}
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
					<CellContainer
						{isEditing}
						{cell}
						{updateCellSymmetry}
						goToNextCell={gridGoToNextCell}
						goToNextCell2={gridGoToNextCell2}
					/>
				{/each}
			</tr>
		{/each}
	{/if}
</table>
