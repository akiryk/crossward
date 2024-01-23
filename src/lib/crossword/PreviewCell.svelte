<script lang="ts">
	export let value: string;
	export let displayNumber: number | string = '';

	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
</script>

<td
	class={`${SHARED_CELL_STYLES} ${SHARED_CELL_FONT_STYLES} bg-white flex justify-center items-center relative`}
	role="gridcell"
>
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
