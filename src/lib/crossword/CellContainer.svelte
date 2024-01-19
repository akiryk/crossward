<script lang="ts">
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import type { DynamicCell } from '$utils/types';
	export let cell: DynamicCell;
	export let isEditing: boolean;
	export let updateCell: (cell: DynamicCell) => void;
	export function handleInput(event: Event) {
		const value = (event.target as HTMLSelectElement)?.value.trim().toUpperCase();
		const newCell = {
			...cell,
			value,
			correctValue: isEditing ? value : cell.correctValue
		};
		updateCell(newCell);
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
