<script lang="ts">
	import { onDestroy } from 'svelte';
	import { getCleanValueOfInput } from '../utils/crosswordHelpers';
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import PreviewCell from './PreviewCell.svelte';
	import GameStore from '../../stores/GameStore';
	import {
		Direction,
		UserMode,
		type ID,
		type Cell as CellType,
		type Coords,
		FirstCellInWord
	} from '$utils/types';
	import { KeyCodes } from '../utils/keyCodes';

	// Props
	export let cell: CellType;
	export let userMode: UserMode;
	export let isPreview: boolean;
	export let onInput: (id: ID) => void;
	export let updatePuzzleData: (cell: CellType) => void;
	export let goToNextCell: (cell: CellType, direction: Direction) => void;
	export let toggleGridDirection: (cell: CellType) => void;
	export let updateCellWithFocus: (coords: Coords) => void;

	let isHighlighted: boolean;
	let shouldSignalWarning: boolean = false;
	let gridDirection: Direction;
	let hasFocus: boolean = false;

	// Game Store
	const unsubscribeGameStore = GameStore.subscribe((data) => {
		gridDirection = data.gridDirection;
		isHighlighted = data.highlightedCellIds.includes(cell.id);
		hasFocus = data.cellWithFocusId === cell.id;
		if (isPreview && data.twoLetterWordIds.includes(cell.id)) {
			shouldSignalWarning = true;
		} else {
			shouldSignalWarning = false;
		}
	});

	onDestroy(() => {
		unsubscribeGameStore();
	});

	function handleInput(event: Event) {
		const cleanValue = getCleanValueOfInput({ event, previousValue: cell.value });
		(event.target as HTMLInputElement).value = cleanValue;
		cell.value = cleanValue;
		if (userMode !== UserMode.PLAY) {
			cell.correctValue = cleanValue;
			updatePuzzleData(cell);

			GameStore.update((current) => {
				if (!current.activeCellIds.includes(cell.id)) {
					current.activeCellIds.push(cell.id);
				}
				return current;
			});
		}
		goToNextCell(cell, Direction.GO_FORWARD);
		onInput(cell.id);
	}

	export function handleOnFocus() {
		updateCellWithFocus({ x: cell.x, y: cell.y });
	}

	export function handleOnBlur() {
		GameStore.update((current) => {
			if (current.cellWithFocusId === cell.id) {
				current.cellWithFocusId = null;
			}
			return current;
		});
	}

	export function handleClick(event: MouseEvent | PointerEvent) {
		// If it's a double click, highlight the row or the column
		// TODO: Implement for touch events as well
		if (event.detail === 2) {
			toggleGridDirection(cell);
		}
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
				if (userMode === UserMode.EDITING_HINTS) {
					return;
				}
				cell.value = '';
				if (userMode === UserMode.EDITING_CELLS) {
					updatePuzzleData(cell);
					cell.correctValue = '';
					GameStore.update((current) => {
						const index = current.activeCellIds.indexOf(cell.id);
						if (index > -1) {
							current.activeCellIds.splice(index, 1);
						}
						return current;
					});
				}
				setTimeout(() => {
					const direction =
						gridDirection === Direction.GO_RIGHT ? Direction.GO_LEFT : Direction.GO_UP;
					goToNextCell(cell, direction);
				}, 0);

				onInput(cell.id);
				break;
			case KeyCodes.LEFT_ARROW_KEY:
				if (gridDirection === Direction.GO_DOWN || gridDirection === Direction.GO_UP) {
					toggleGridDirection(cell);
				}
				goToNextCell(cell, Direction.GO_LEFT);
				break;
			case KeyCodes.RIGHT_ARROW_KEY:
				if (gridDirection === Direction.GO_DOWN || gridDirection === Direction.GO_UP) {
					toggleGridDirection(cell);
				}
				goToNextCell(cell, Direction.GO_RIGHT);
				break;

			case KeyCodes.UP_ARROW_KEY:
				if (gridDirection === Direction.GO_LEFT || gridDirection === Direction.GO_RIGHT) {
					toggleGridDirection(cell);
				}
				goToNextCell(cell, Direction.GO_UP);
				break;
			case KeyCodes.DOWN_ARROW_KEY:
				if (gridDirection === Direction.GO_LEFT || gridDirection === Direction.GO_RIGHT) {
					toggleGridDirection(cell);
				}
				goToNextCell(cell, Direction.GO_DOWN);
				break;
			default:
				break;
		}
	}

	$: cellValue = cell.value;
	$: cellCorrectValue = cell.correctValue;
	$: isError = isPreview && cell.isSymmetrical && !cell.correctValue;
	$: isWarning = isPreview && shouldSignalWarning;
	$: isBlack = isPreview && !cell.value && !isError && !isWarning;
	$: tabindex = getTabIndex(userMode, gridDirection, cell.firstCellInWordType);

	function getTabIndex(
		userMode: UserMode,
		gridDirection: Direction,
		firstCellInWordType?: FirstCellInWord
	) {
		if (userMode === UserMode.PLAY) {
			if (
				(firstCellInWordType === FirstCellInWord.ACROSS ||
					firstCellInWordType === FirstCellInWord.BOTH) &&
				gridDirection === Direction.GO_RIGHT
			) {
				return '0';
			} else if (
				(firstCellInWordType === FirstCellInWord.DOWN ||
					firstCellInWordType === FirstCellInWord.BOTH) &&
				gridDirection === Direction.GO_DOWN
			) {
				return '0';
			} else {
				return '-1';
			}
		} else {
			return cell.id === '0:0' ? '0' : '-1';
		}
	}
</script>

{#if userMode === UserMode.PLAY && cell.correctValue}
	<Cell
		displayNumber={cell.displayNumber}
		value={cellValue}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onFocus={handleOnFocus}
		onBlur={handleOnBlur}
		{hasFocus}
		onClick={handleClick}
		{isHighlighted}
		{userMode}
		{tabindex}
	/>
{:else if userMode === UserMode.EDITING_CELLS || (userMode === UserMode.EDITING_HINTS && cellCorrectValue)}
	<Cell
		displayNumber={userMode === UserMode.EDITING_HINTS ? cell.displayNumber : 0}
		value={cellCorrectValue}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onFocus={handleOnFocus}
		onBlur={handleOnBlur}
		isSymmetrical={cell.isSymmetrical}
		{hasFocus}
		onClick={handleClick}
		{isHighlighted}
		{userMode}
		{isWarning}
		{isError}
		{isBlack}
		{tabindex}
	/>
{:else if userMode === UserMode.GAME_OVER}
	<PreviewCell displayNumber={cell.displayNumber} value={cellCorrectValue} />
{:else}
	<DeadCell />
{/if}
