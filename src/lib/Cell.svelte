<script lang="ts">
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	export let inputClasses = 'caret-transparent cursor-pointer selection:bg-transparent ';
	export let displayNumber: number | undefined;
	export let value;
	import CellWrapper from '$lib/CellWrapper.svelte';
</script>

<CellWrapper {displayNumber}>
	<input class={inputClasses} {value} />
</CellWrapper>
