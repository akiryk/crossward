<script lang="ts">
	export let value: string;
	export let displayNumber: number | string = '';
	export let missingValueForSymmetricalCell: boolean;

	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES =
		'w-10 h-10 outline outline-1 outline-gray-400 border-none flex justify-center items-center relative';
	const COMBINED_STYLES = `${SHARED_CELL_STYLES} ${SHARED_CELL_FONT_STYLES}`;
	const bgColor = missingValueForSymmetricalCell ? 'bg-red-500' : value ? 'bg-white' : 'bg-black';
	export const styles = `${COMBINED_STYLES} ${bgColor}`;
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
