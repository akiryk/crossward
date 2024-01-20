<script lang="ts">
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import type { DynamicCell } from '$utils/types';
	import { KeyCodes } from './utils/keyCodes';
	export let cell: DynamicCell;
	export let isEditing: boolean;
	export let updateCellSymmetry: (cell: DynamicCell) => void;

	export function handleInput(event: Event) {
		const value = (event.target as HTMLSelectElement)?.value.trim().toUpperCase();
		cell.value = value;
		if (isEditing) {
			cell.correctValue = value;
		}
		updateCellSymmetry(cell);
	}

	export function handleKeyDown(event: KeyboardEvent) {
		const code = event.code.toUpperCase();
		switch (code) {
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
				// goToNextCell({ row, column, overrideDirectionMode: GO_RIGHT_TO_LEFT });
				break;
			case KeyCodes.RIGHT_ARROW_KEY:
				// goToNextCell({ row, column, overrideDirectionMode: GO_LEFT_TO_RIGHT });
				break;
			case KeyCodes.UP_ARROW_KEY:
				// goToNextCell({ row, column, overrideDirectionMode: GO_BOTTOM_TO_TOP });
				break;
			case KeyCodes.DOWN_ARROW_KEY:
				// goToNextCell({ row, column, overrideDirectionMode: GO_TOP_TO_BOTTOM });
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
		isSymmetrical={cell.isSymmetrical}
	/>
{:else}
	<!-- DeadCell is a non-interactive black square -->
	<DeadCell />
{/if}
