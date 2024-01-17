<script lang="ts">
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import type DynamicCell from '$lib/crossword/utils/DynamicCell';
	import type DynamicGrid from '$lib/crossword/utils/DynamicGrid';

	export let cell: DynamicCell;
	export let dynamicGrid: DynamicGrid;
	export let isEditing: boolean;

	export function handleInput(event: Event) {
		const value = (event.target as HTMLSelectElement)?.value.trim();
		cell.setValue(value);
		if (isEditing) {
			dynamicGrid.ensureRotationalSymmetry({ x: cell.x, y: cell.y });
		} else {
			// updateWorkingAnswers(cell);
		}
	}
</script>

{#if cell}
	<Cell
		displayNumber={cell.displayNumber}
		value={isEditing ? cell.correctValue : cell.value}
		onInput={handleInput}
		isSymmetrical={cell.isSymmetrical}
	/>
{:else}
	<!-- DeadCell is a non-interactive black square -->
	<DeadCell />
{/if}
