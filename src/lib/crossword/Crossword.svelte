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

	export let onInput: (id: ID) => void = () => {};
	export let userMode: UserMode;
	export let isPreview: boolean = false;
	let gridDirection = Direction.GO_RIGHT;
	let puzzle: EditorPuzzle | PlayerPuzzle;

	const unsubscribePuzzleStore = PuzzleStore.subscribe((data) => {
		if (data) {
			puzzle = data;
		}
	});

	const unsubscribeGameStore = GameStore.subscribe((data) => {
		gridDirection = data.gridDirection;
	});

	onDestroy(() => {
		unsubscribeGameStore();
		unsubscribePuzzleStore();
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
		const highlightedCellIds = getHighlightedCellIds(puzzle.cellMap[id]);

		GameStore.update((current) => {
			return {
				...current,
				cellWithFocusId: id,
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
		// puzzle.cellMap[id].hasFocus = false;
		// puzzle.cellRows[cell.y][cell.x].hasFocus = false;
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

	export function updatePuzzleData(cell: Cell) {
		const symmetricalCell = getSymmetricalCell(puzzle, { x: cell.x, y: cell.y });
		cell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		symmetricalCell.isSymmetrical = !!cell.value || !!symmetricalCell.value;
		puzzle.cellMap[cell.id] = cell;
		puzzle.cellMap[symmetricalCell.id] = symmetricalCell;
		puzzle.cellRows[cell.y][cell.x] = cell;
		puzzle.cellRows[symmetricalCell.y][symmetricalCell.x] = symmetricalCell;
		if (userMode === UserMode.EDITING_HINTS) {
			if (typeof cell.acrossWordStartX === 'number' && typeof cell.acrossWordEndX === 'number') {
				const cellDisplayNumber =
					puzzle.cellMap[`${cell.acrossWordStartX}:${cell.y}`].displayNumber;
				const indexOfAcrossHint = puzzle.acrossHints.findIndex(
					(hint) => hint.displayNumber === cellDisplayNumber
				);
				// puzzle.acrossHints[indexOfAcrossHint].answer ===
				// update the answer word to match the updated cell value
				let word = '';
				for (let x = cell.acrossWordStartX; x < cell.acrossWordEndX + 1; x++) {
					const id = getId({ x, y: cell.y });
					word += puzzle.cellMap[id].correctValue;
				}
				puzzle.acrossHints[indexOfAcrossHint].answer = word;
			}

			if (typeof cell.downWordStartY === 'number' && typeof cell.downWordEndY === 'number') {
				const cellDisplayNumber = puzzle.cellMap[`${cell.x}:${cell.downWordStartY}`].displayNumber;
				const indexOfDownHint = puzzle.downHints.findIndex(
					(hint) => hint.displayNumber === cellDisplayNumber
				);
				// update the answer word to match the updated cell value
				let word = '';
				for (let y = cell.downWordStartY; y < cell.downWordEndY + 1; y++) {
					const id = getId({ x: cell.x, y });
					word += puzzle.cellMap[id].correctValue;
				}
				puzzle.downHints[indexOfDownHint].answer = word;
			}
		}
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
	class="relative table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#if puzzle}
		{#each puzzle.cellRows as row}
			<tr class="flex justify-center flex-wrap">
				{#each row as cell}
					<CellContainer
						{userMode}
						{cell}
						{updatePuzzleData}
						{toggleGridDirection}
						{goToNextCell}
						{updateCellWithFocus}
						{onInput}
						{isPreview}
					/>
				{/each}
			</tr>
		{/each}
	{/if}
</table>
