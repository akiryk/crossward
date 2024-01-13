<script lang="ts">
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	export const SHARED_INPUT_STYLES =
		'caret-transparent cursor-pointer selection:bg-transparent  focus:bg-cyan-300';
	export let inputClasses = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES}`;
	export let displayNumber: number;
	export let value: string;
	import CellWrapper from '$lib/crossword/CellWrapper.svelte';
</script>

<CellWrapper {displayNumber}>
	<input class={inputClasses} {value} />
</CellWrapper>
