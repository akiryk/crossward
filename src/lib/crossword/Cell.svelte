<script lang="ts">
	export let value: string;
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	export const SHARED_INPUT_STYLES =
		'caret-transparent cursor-pointer selection:bg-transparent focus:bg-cyan-300';
	export let inputClasses = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES}`;
	export let displayNumber: number;
	export let isSymmetrical: boolean;
	export let onInput: (event: Event) => void;
</script>

<td class="relative" role="gridcell">
	<input
		on:input={onInput}
		class={value ? `${inputClasses} bg-white` : `${inputClasses} bg-gray-200`}
		bind:value
	/>
	{#if !!displayNumber}
		<span class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none">
			{displayNumber}
		</span>
	{/if}
</td>
