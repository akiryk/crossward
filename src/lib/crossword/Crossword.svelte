<script lang="ts">
	import { onDestroy } from 'svelte';
	import CellContainer from './CellContainer.svelte';
	import type {
		EditorPuzzle,
		PlayerPuzzle,
		Coords,
		GetNextCellProps,
		ID,
		Cell
	} from '$utils/types';
	import { Direction, UserMode } from '$utils/types';
	import { getId } from '$utils/helpers';
	import PuzzleStore from '../../stores/PuzzleStore';
	import GameStore from '../../stores/GameStore';
	import {
		getSymmetricalCell,
		getIdFromCoords,
		getCellAbove,
		getCellBelow,
		getCellToTheLeft,
		getCellToTheRight
	} from '../utils/crosswordHelpers';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let onInput: (id: ID) => void = (id: ID) => {};
	export let puzzle: PlayerPuzzle | EditorPuzzle;
	export let userMode: UserMode;
	let gridDirection = Direction.GO_RIGHT;
	let highlightedCellIds: Array<ID> = [];

	// Game Store
	const unsubscribeGameStore = GameStore.subscribe((data) => {
		gridDirection = data.gridDirection;
		highlightedCellIds = data.highlightedCellIds;
	});

	onDestroy(() => {
		unsubscribeGameStore();
	});

	function getHighlightedCellIds(cell: Cell): Array<ID> {
		let highlightedCellIds: Array<ID> = [];
		const currentCellX = cell.x;
		const currentCellY = cell.y;
		if (userMode === UserMode.PLAY) {
			if (gridDirection === Direction.GO_RIGHT) {
				if (
					typeof cell.acrossWordStartX === 'number' &&
					cell.acrossWordEndX &&
					cell.x >= cell.acrossWordStartX &&
					cell.x <= cell.acrossWordEndX
				) {
					for (let i = cell.acrossWordStartX; i <= cell.acrossWordEndX; i++) {
						highlightedCellIds.push(getId({ x: i, y: cell.y }));
					}
				}
			} else {
				if (
					typeof cell.downWordStartY === 'number' &&
					cell.downWordEndY &&
					cell.y >= cell.downWordStartY &&
					cell.y <= cell.downWordEndY
				) {
					for (let i = cell.downWordStartY; i <= cell.downWordEndY; i++) {
						highlightedCellIds.push(getId({ x: cell.x, y: i }));
					}
				}
			}
		} else {
			if (gridDirection === Direction.GO_RIGHT) {
				for (let x = 0; x < puzzle.acrossSpan; x++) {
					highlightedCellIds.push(getId({ x, y: currentCellY }));
				}
			} else {
				for (let y = 0; y < puzzle.downSpan; y++) {
					highlightedCellIds.push(getId({ x: currentCellX, y }));
				}
			}
		}
		return highlightedCellIds;
	}

	function updateCellWithFocus(coords: Coords) {
		const id = getIdFromCoords(coords);
		const { x, y } = coords;
		puzzle.cellMap[id].hasFocus = true;
		puzzle.cellRows[y][x].hasFocus = true;
		const highlightedCellIds = getHighlightedCellIds(puzzle.cellMap[id]);

		GameStore.update((current) => {
			return {
				...current,
				highlightedCellIds
			};
		});
	}

	/**
	 * Exported Functions
	 *
	 * goToNextCell
	 * toggleGridDirection
	 * updateCellSymmetry
	 */
	export function goToNextCell(cell: Cell, direction: Direction) {
		let nextCellFunction: (props: GetNextCellProps) => Coords;
		switch (direction) {
			case Direction.GO_FORWARD:
				nextCellFunction = gridDirection === Direction.GO_RIGHT ? getCellToTheRight : getCellBelow;
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
		puzzle.cellRows[cell.y][cell.x].hasFocus = false;
		const nextCellCoords = nextCellFunction({
			coords: { x: cell.x, y: cell.y },
			acrossSpan: puzzle.acrossSpan,
			downSpan: puzzle.downSpan
		});
		if (userMode === UserMode.PLAY && !puzzle.cellMap[getId(nextCellCoords)].correctValue) {
			return;
		}
		updateCellWithFocus(nextCellCoords);
	}

	export function updateCellSymmetry(cell: Cell) {
		const symmetricalCell = getSymmetricalCell(puzzle, { x: cell.x, y: cell.y });
		cell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		symmetricalCell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		puzzle.cellMap[cell.id] = cell;
		puzzle.cellMap[symmetricalCell.id] = symmetricalCell;
		puzzle.cellRows[cell.y][cell.x] = cell;
		puzzle.cellRows[symmetricalCell.y][symmetricalCell.x] = symmetricalCell;
		PuzzleStore.set(puzzle);
	}

	export function toggleGridDirection(cell: Cell) {
		gridDirection = gridDirection === Direction.GO_RIGHT ? Direction.GO_DOWN : Direction.GO_RIGHT;
		const highlightedCellIds = getHighlightedCellIds(puzzle.cellMap[cell.id]);
		GameStore.update((current) => ({
			...current,
			gridDirection,
			highlightedCellIds
		}));
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
						{userMode}
						{cell}
						{updateCellSymmetry}
						{toggleGridDirection}
						{goToNextCell}
						{updateCellWithFocus}
						isHighlighted={highlightedCellIds.includes(cell.id)}
						{onInput}
					/>
				{/each}
			</tr>
		{/each}
	{/if}
</table>
