<script lang="ts">
	import { getCleanValueOfInput } from './utils/crosswordHelpers';
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import { Direction, type DynamicCell } from '$utils/types';
	import { KeyCodes } from './utils/keyCodes';
	export let cell: DynamicCell;
	export let isEditing: boolean;
	export let updateCellSymmetry: (cell: DynamicCell) => void;
	export let goToNextCell: (cell: DynamicCell, direction: Direction) => void;

	let previousValue = '';

	export function handleInput(event: Event) {
		const cleanValue = getCleanValueOfInput({ event, previousValue });
		(event.target as HTMLInputElement).value = cleanValue;
		cell.value = cleanValue;
		previousValue = cleanValue;
		if (isEditing) {
			cell.correctValue = cleanValue;
		}
		updateCellSymmetry(cell);
		goToNextCell(cell, Direction.GO_RIGHT);
	}

	export function handleOnBlur() {
		cell.cellHasFocus = false;
	}

	export function handleKeyDown(event: KeyboardEvent) {
		const code = event.code.toUpperCase();
		switch (code) {
			case KeyCodes.TAB_KEY:
				cell.value = '';
			case KeyCodes.SPACEBAR_KEY:
				// toggleGridDirection(cell);
				break;
			case KeyCodes.DELETE_KEY:
				cell.value = '';
				if (isEditing) {
					cell.correctValue = '';
				}
				updateCellSymmetry(cell);
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
</script>

{#if cell}
	<Cell
		displayNumber={cell.displayNumber}
		value={isEditing ? cell.correctValue : cell.value}
		onInput={handleInput}
		onKeydown={handleKeyDown}
		onBlur={handleOnBlur}
		isSymmetrical={cell.isSymmetrical}
		cellHasFocus={cell.cellHasFocus}
	/>
{:else}
	<!-- DeadCell is a non-interactive black square -->
	<DeadCell />
{/if}
