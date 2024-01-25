<script lang="ts">
	import CellContainer from './CellContainer.svelte';
	import type { DynamicCell, Puzzle, Coords, GetNextCellProps, ID } from '$utils/types';
	import { Direction, GameStatus } from '$utils/types';
	import { getId } from '$utils/helpers';
	import PuzzleStore from '../../stores/PuzzleStore';
	import {
		getSymmetricalCell,
		getIdFromCoords,
		getCellAbove,
		getCellBelow,
		getCellToTheLeft,
		getCellToTheRight
	} from './utils/crosswordHelpers';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let puzzle: Puzzle;
	export let gameStatus: GameStatus;
	let currentDirection = Direction.GO_RIGHT;

	function getHighlightedCell(cell: DynamicCell) {
		let highlightedCellIds: Array<ID> = [];
		const currentCellX = cell.x;
		const currentCellY = cell.y;
		if (currentDirection === Direction.GO_RIGHT) {
			for (let x = 0; x < puzzle.acrossSpan; x++) {
				highlightedCellIds.push(getId({ x, y: currentCellY }));
			}
		} else {
			for (let y = 0; y < puzzle.downSpan; y++) {
				highlightedCellIds.push(getId({ x: currentCellX, y }));
			}
		}
		return highlightedCellIds;
	}

	function updateCellWithFocus(coords: Coords) {
		const id = getIdFromCoords(coords);
		const { x, y } = coords;
		puzzle.cellMap[id].hasFocus = true;
		const index = puzzle.cellMap[id].index;
		puzzle.cellRows[y][x].hasFocus = true;
		puzzle.highlightedCellIds = getHighlightedCell(puzzle.cellMap[id]);
		PuzzleStore.set(puzzle);
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
		puzzle.cellMap[id].hasFocus = false;
		const index = puzzle.cellMap[id].index;
		puzzle.cellRows[cell.y][cell.x].hasFocus = false;
		const nextCellCoords = nextCellFunction({
			coords: { x: cell.x, y: cell.y },
			acrossSpan: puzzle.acrossSpan,
			downSpan: puzzle.downSpan
		});
		updateCellWithFocus(nextCellCoords);
	}

	export function updateCellSymmetry(cell: DynamicCell) {
		const symmetricalCell = getSymmetricalCell(puzzle, { x: cell.x, y: cell.y });
		const symmetricalCellIndex = symmetricalCell.index;
		cell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		symmetricalCell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		puzzle.cellMap[cell.id] = cell;
		puzzle.cellMap[symmetricalCell.id] = symmetricalCell;
		puzzle.cellRows[cell.y][cell.x] = cell;
		puzzle.cellRows[symmetricalCell.y][symmetricalCell.x] = symmetricalCell;
		PuzzleStore.set(puzzle);
	}

	export function toggleGridDirection(cell: DynamicCell) {
		currentDirection =
			currentDirection === Direction.GO_RIGHT ? Direction.GO_DOWN : Direction.GO_RIGHT;
		puzzle.highlightedCellIds = getHighlightedCell(puzzle.cellMap[cell.id]);
		PuzzleStore.set(puzzle);
	}
</script>

<table
	class="relative w-fit mb-10 table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#if puzzle}
		{#each puzzle.cellRows as row}
			<tr class="flex justify-center flex-wrap" role="row">
				{#each row as cell}
					<CellContainer
						{gameStatus}
						{cell}
						{updateCellSymmetry}
						{toggleGridDirection}
						{goToNextCell}
						{updateCellWithFocus}
						isHighlighted={puzzle.highlightedCellIds.includes(cell.id)}
						{currentDirection}
					/>
				{/each}
			</tr>
		{/each}
	{/if}
</table>
