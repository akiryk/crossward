<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getCleanValueOfInput } from '../utils/crosswordHelpers';
	import PuzzleStore from '../../stores/PuzzleStore';
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import PreviewCell from './PreviewCell.svelte';
	import {
		Direction,
		GameStatus,
		type ID,
		type Puzzle,
		type DynamicCell,
		type Coords
	} from '$utils/types';
	import { KeyCodes } from '../utils/keyCodes';
	import { GAME_OVER } from '$utils/constants';

	// Props
	export let cell: DynamicCell;
	export let gameStatus: GameStatus;
	export let isHighlighted: boolean;
	export let currentDirection: Direction;
	export let onInput: () => void;
	export let updateCellSymmetry: (cell: DynamicCell) => void;
	export let goToNextCell: (cell: DynamicCell, direction: Direction) => void;
	export let toggleGridDirection: (cell: DynamicCell) => void;
	export let updateCellWithFocus: (coords: Coords) => void;

	let data: Puzzle;
	$: data = data;

	const unsubscribe = PuzzleStore.subscribe((value) => {
		if (value) {
			data = value;
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

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
		if (gameStatus === GameStatus.EDITING_CELLS) {
			cell.correctValue = cleanValue;
			updateCellSymmetry(cell);
		}
		goToNextCell(cell, Direction.GO_FORWARD);
		onInput();
	}

	export function handleOnFocus() {
		updateCellWithFocus({ x: cell.x, y: cell.y });
	}

	export function handleOnBlur() {
		cell.hasFocus = false;
	}

	export function handleClick(event: MouseEvent) {
		// if (cellIsInteractive) {
		// If it's a double click, highlight the row or the column
		if (event.detail === 2) {
			toggleGridDirection(cell);
		}
		// }
	}

	export function handleKeyDown(event: KeyboardEvent) {
		const code = event.code.toUpperCase();
		switch (code) {
			case KeyCodes.SPACEBAR_KEY:
				// prevent default so spacebar doesn't insert a blank space
				// and move cursor to next cell
				event.preventDefault();
				toggleGridDirection(cell);
				break;
			case KeyCodes.DELETE_KEY:
				cell.value = '';
				previousValue = '';
				if (gameStatus === GameStatus.EDITING_CELLS) {
					updateCellSymmetry(cell);
					cell.correctValue = '';
				}
				setTimeout(() => {
					const direction =
						currentDirection === Direction.GO_RIGHT ? Direction.GO_LEFT : Direction.GO_UP;
					goToNextCell(cell, direction);
				}, 0);
				onInput();
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
	$: shouldHighlightFalse = data?.incorrectCells?.includes(cell.id);
	$: isGameOver = data?.publishStatus === GAME_OVER;
</script>

{#if gameStatus === GameStatus.PLAY && cell.correctValue}
	<Cell
		displayNumber={cell.displayNumber}
		value={cellValue}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onFocus={handleOnFocus}
		onBlur={handleOnBlur}
		hasFocus={cell.hasFocus}
		onClick={handleClick}
		{isHighlighted}
		{gameStatus}
		isFalseValue={shouldHighlightFalse}
		{isGameOver}
	/>
{:else if gameStatus === GameStatus.EDITING_CELLS}
	<Cell
		displayNumber={cell.displayNumber}
		value={cellCorrectValue}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onFocus={handleOnFocus}
		onBlur={handleOnBlur}
		isSymmetrical={cell.isSymmetrical}
		hasFocus={cell.hasFocus}
		onClick={handleClick}
		{isHighlighted}
		{gameStatus}
	/>
{:else if gameStatus === GameStatus.PREVIEW}
	<PreviewCell
		displayNumber={cell.displayNumber}
		value={cellCorrectValue}
		missingValueForSymmetricalCell={cell.isSymmetrical && !cell.correctValue}
	/>
{:else if gameStatus === GameStatus.EDITING_HINTS}
	<PreviewCell displayNumber={cell.displayNumber} value={cellCorrectValue} />
{:else}
	<DeadCell />
{/if}
