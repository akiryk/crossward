<script lang="ts">
	import { getCleanValueOfInput } from './utils/crosswordHelpers';
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import PreviewCell from './PreviewCell.svelte';
	import { Direction, GameStatus, CellStatus, type DynamicCell, type Coords } from '$utils/types';
	import { KeyCodes } from './utils/keyCodes';

	// Props
	export let cell: DynamicCell;
	export let gameStatus: GameStatus;
	export let isHighlighted: boolean;
	export let currentDirection: Direction;
	export let updateCellSymmetry: (cell: DynamicCell) => void;
	export let goToNextCell: (cell: DynamicCell, direction: Direction) => void;
	export let toggleGridDirection: (cell: DynamicCell) => void;
	export let updateCellWithFocus: (coords: Coords) => void;

	$: cellStatus = getCellStatus(cell, gameStatus);

	function getCellStatus(cell: DynamicCell, gameStatus: GameStatus) {
		if (!cell) {
			return CellStatus.DEAD_CELL;
		}
		switch (gameStatus) {
			case GameStatus.EDIT_GRID:
				return CellStatus.EDIT_CELL;
			case GameStatus.EDIT_HINTS:
				return cell.correctValue ? CellStatus.PREVIEW_CELL : CellStatus.DEAD_CELL;
			case GameStatus.PREVIEW:
				return CellStatus.PREVIEW_CELL;
			case GameStatus.PLAY:
				return CellStatus.PLAY_CELL;
			default:
				return CellStatus.PLAY_CELL;
		}
	}

	function getCellStyle(cell: DynamicCell, gameStatus: GameStatus) {
		if (!cell) {
			return CellStatus.DEAD_CELL;
		}
		switch (gameStatus) {
			case GameStatus.EDIT_GRID:
				return CellStatus.EDIT_CELL;
			case GameStatus.EDIT_HINTS:
				return CellStatus.PREVIEW_CELL;
			case GameStatus.PREVIEW:
				return CellStatus.PREVIEW_CELL;
			case GameStatus.PLAY:
				return CellStatus.PLAY_CELL;
			default:
				return CellStatus.PLAY_CELL;
		}
	}

	// Track previous value so that we can be sure to always save only
	// the most recently entered value. Using event.target.value.slice(-1)
	// gets the last value, but this isn't always the last value entered
	// by the user.
	let previousValue = cell.value;

	export function handleInput(event: Event) {
		const cleanValue = getCleanValueOfInput({ event, previousValue: cell.value });
		(event.target as HTMLInputElement).value = cleanValue;
		cell.value = cleanValue;
		previousValue = cleanValue;
		if (gameStatus === GameStatus.EDIT_GRID) {
			cell.correctValue = cleanValue;
		}
		updateCellSymmetry(cell);
		goToNextCell(cell, Direction.GO_FORWARD);
	}

	export function handleOnFocus() {
		updateCellWithFocus({ x: cell.x, y: cell.y });
	}

	export function handleOnBlur() {
		cell.hasFocus = false;
	}

	export function handleKeyDown(event: KeyboardEvent) {
		const code = event.code.toUpperCase();
		switch (code) {
			case KeyCodes.TAB_KEY:
				cell.value = '';
			case KeyCodes.SPACEBAR_KEY:
				// prevent default so spacebar doesn't insert a blank space
				// and move cursor to next cell
				event.preventDefault();
				toggleGridDirection(cell);
				break;
			case KeyCodes.DELETE_KEY:
				cell.value = '';
				updateCellSymmetry(cell);
				previousValue = '';
				if (gameStatus === GameStatus.EDIT_GRID) {
					cell.correctValue = '';
				}
				setTimeout(() => {
					const direction =
						currentDirection === Direction.GO_RIGHT ? Direction.GO_LEFT : Direction.GO_UP;
					goToNextCell(cell, direction);
				}, 0);
				break;
			case KeyCodes.LEFT_ARROW_KEY:
				goToNextCell(cell, Direction.GO_LEFT);
				break;
			case KeyCodes.RIGHT_ARROW_KEY:
				goToNextCell(cell, Direction.GO_RIGHT);
				break;
			case KeyCodes.UP_ARROW_KEY:
				goToNextCell(cell, Direction.GO_UP);
				break;
			case KeyCodes.DOWN_ARROW_KEY:
				goToNextCell(cell, Direction.GO_DOWN);
				break;
			default:
				break;
		}
	}

	$: cellValue = cell.value;
	$: cellCorrectValue = cell.correctValue;
</script>

{#if cellStatus === CellStatus.EDIT_CELL}
	<Cell
		displayNumber={cell.displayNumber}
		value={cellCorrectValue}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onFocus={handleOnFocus}
		onBlur={handleOnBlur}
		isSymmetrical={cell.isSymmetrical}
		hasFocus={cell.hasFocus}
		{isHighlighted}
	/>
{:else if cellStatus === CellStatus.PREVIEW_CELL}
	<PreviewCell displayNumber={cell.displayNumber} value={cellCorrectValue} />
{:else}
	<!-- DeadCell is a non-interactive black square -->
	<DeadCell />
{/if}
