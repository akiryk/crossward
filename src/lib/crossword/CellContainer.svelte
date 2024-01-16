<script lang="ts">
	import Cell from './Cell.svelte';
	import DeadCell from './DeadCell.svelte';
	import type { Cell as CellType } from '$utils/types';
	export let cell: CellType | null;
	export let isEditing: boolean;
</script>

{#if cell && isEditing}
	<Cell displayNumber={cell.displayNumber} value={cell.correctValue} />
{:else if cell}
	<Cell displayNumber={cell.displayNumber} value={cell.value} />
{:else}
	<DeadCell />
{/if}
