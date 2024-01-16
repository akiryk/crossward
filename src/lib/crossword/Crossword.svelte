<script lang="ts">
	import CellContainer from './CellContainer.svelte';

	import type { Grid, Rows } from '$utils/types';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';

	export let grid: Grid = {
		acrossSpan: 15,
		downSpan: 15,
		cellMap: null,
		acrossHints: [],
		downHints: []
	};

	export let isEditing = false;

	export let rows: Rows = [];
	if (grid.cellMap) {
		for (let y = 0; y < grid.downSpan; y++) {
			const row = [];
			for (let x = 0; x < grid.acrossSpan; x++) {
				row.push(grid.cellMap[`${x}:${y}`]);
			}
			rows.push(row);
		}
	}
</script>

<table
	class="relative w-fit mb-10 table-fixed border-collapse"
	cellpadding="0"
	cellspacing="0"
	border="0"
	role="grid"
>
	{#each rows as row}
		<tr class="flex justify-center flex-wrap" role="row">
			{#each row as cell}
				<CellContainer {isEditing} {cell} />
			{/each}
		</tr>
	{/each}
</table>
