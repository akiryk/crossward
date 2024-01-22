<script lang="ts">
	import CellContainer from './CellContainer.svelte';
	import type { DynamicCell, DynamicGrid, Coords, GetNextCellProps, ID } from '$utils/types';
	import { Direction } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	import {
		getSymmetricalCell,
		getIdFromCoords,
		getCellAbove,
		getCellBelow,
		getCellToTheLeft,
		getCellToTheRight,
		getId
	} from './utils/crosswordHelpers';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let grid: DynamicGrid;
	export let isEditing = false;
	let currentDirection = Direction.GO_RIGHT;

	function getHighlightedCell(cell: DynamicCell) {
		let highlightedCellIds: Array<ID> = [];
		const currentCellX = cell.x;
		const currentCellY = cell.y;
		if (currentDirection === Direction.GO_RIGHT) {
			for (let x = 0; x < grid.acrossSpan; x++) {
				highlightedCellIds.push(getId(x, currentCellY));
			}
		} else {
			for (let y = 0; y < grid.downSpan; y++) {
				highlightedCellIds.push(getId(currentCellX, y));
			}
		}
		return highlightedCellIds;
	}

	function updateCellWithFocus(coords: Coords) {
		const id = getIdFromCoords(coords);
		const { x, y } = coords;
		grid.cellMap[id].hasFocus = true;
		const index = grid.cellMap[id].index;
		grid.cellsArray[index].hasFocus = true;
		grid.cellRows[y][x].hasFocus = true;
		grid.highlightedCellIds = getHighlightedCell(grid.cellMap[id]);
		PuzzleStore.set(grid);
	}

	/**
	 * Exported Functions
	 *
	 * goToNextCell
	 * toggleGridDirection
	 * updateCellSymmetry
	 */
	export function goToNextCell(cell: DynamicCell, direction: Direction) {
		let nextCellFunction: (props: GetNextCellProps) => Coords;
		switch (direction) {
			case Direction.GO_FORWARD:
				nextCellFunction =
					currentDirection === Direction.GO_RIGHT ? getCellToTheRight : getCellBelow;
				break;
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
		grid.cellMap[id].hasFocus = false;
		const index = grid.cellMap[id].index;
		grid.cellsArray[index].hasFocus = false;
		grid.cellRows[cell.y][cell.x].hasFocus = false;
		const nextCellCoords = nextCellFunction({
			coords: { x: cell.x, y: cell.y },
			acrossSpan: grid.acrossSpan,
			downSpan: grid.downSpan
		});
		updateCellWithFocus(nextCellCoords);
	}

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

	export function toggleGridDirection(cell: DynamicCell) {
		currentDirection =
			currentDirection === Direction.GO_RIGHT ? Direction.GO_DOWN : Direction.GO_RIGHT;
		grid.highlightedCellIds = getHighlightedCell(grid.cellMap[cell.id]);
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
						{toggleGridDirection}
						{goToNextCell}
						{updateCellWithFocus}
						isHighlighted={grid.highlightedCellIds.includes(cell.id)}
					/>
				{/each}
			</tr>
		{/each}
	{/if}
</table>
