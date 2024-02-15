<script lang="ts">
	export let value: string;
	export let displayNumber: number | string = '';

	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES =
		'w-10 h-10 outline outline-1  border-none flex justify-center items-center relative select-none';
	const COMBINED_STYLES = `${SHARED_CELL_STYLES} ${SHARED_CELL_FONT_STYLES}`;
	const bgColor = value ? 'bg-blue-100' : 'bg-black';
	const borderColor = gameOver ? 'outline-blue-400' : 'outline-gray-400';
	export const styles = `${COMBINED_STYLES} ${bgColor} ${borderColor}`;
</script>

<td class={`${styles} `} role="gridcell">
	<span>{value}</span>
	{#if displayNumber}
		<span
			data-testid="displayNumber"
			class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none"
		>
			{displayNumber}
		</span>
	{/if}
</td>
