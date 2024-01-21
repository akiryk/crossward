<script lang="ts">
	// Props
	export let value: string;
	export let displayNumber: number;
	export let isSymmetrical: boolean;
	export let cellHasFocus: boolean;
	export let onInput: (event: Event) => void;
	export let onKeydown: (event: KeyboardEvent) => void;
	export let onBlur: (event: Event) => void;

	let inputElement: HTMLInputElement;
	export const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	export const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	export const SHARED_INPUT_STYLES =
		'caret-transparent cursor-pointer selection:bg-transparent focus:bg-cyan-300';
	export const CLASSES = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES}`;
	$: inputClasses = value || isSymmetrical ? `${CLASSES} bg-white` : `${CLASSES} bg-gray-200`;
	$: if (cellHasFocus) {
		inputElement.focus();
	}
</script>

<td class="relative" role="gridcell">
	<input
		type="text"
		class={inputClasses}
		on:input={onInput}
		on:keydown={onKeydown}
		bind:this={inputElement}
		on:blur={onBlur}
		{value}
	/>
	{#if !!displayNumber}
		<span class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none">
			{displayNumber}
		</span>
	{/if}
</td>
