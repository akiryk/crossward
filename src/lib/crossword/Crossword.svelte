<script lang="ts">
	import DeadCell from './DeadCell.svelte';
	import Cell from './Cell.svelte';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	type Cell = {
		correctValue: string;
		displayNumber: number;
		id: string;
		value: string;
		x: number;
		y: number;
	};
	type Row = Array<Cell | null>;
	type Rows = Array<Row>;
	type ID = `${number}:${number}`;
	type Puzzle = {
		downSpan: number;
		acrossSpan: number;
		cellsMap: Record<ID, Cell>;
	};

	export let grid: Puzzle = {
		downSpan: 0,
		acrossSpan: 0,
		cellsMap: {
			'0:0': {
				displayNumber: 0,
				value: '',
				correctValue: '',
				id: '',
				x: 0,
				y: 0
			}
		}
	};

	export let rows: Rows = [];

	for (let y = 0; y < grid.downSpan; y++) {
		const row = [];
		for (let x = 0; x < grid.acrossSpan; x++) {
			row.push(grid.cellsMap[`${x}:${y}`]);
		}
		rows.push(row);
	}
</script>

<p>Crossward</p>
<table
	class="relative w-fit m-auto table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#each rows as row}
		<tr class="flex justify-center flex-wrap" role="row">
			{#each row as cell}
				{#if cell?.correctValue === ''}
					<DeadCell />
				{:else if cell}
					<td
						class={`${SHARED_CELL_STYLES} ${SHARED_CELL_FONT_STYLES} bg-white flex justify-center items-center`}
						role="gridcell"
					>
						<Cell displayNumber={cell.displayNumber} value={cell.correctValue} />
					</td>
				{/if}
			{/each}
		</tr>
	{/each}
</table>
