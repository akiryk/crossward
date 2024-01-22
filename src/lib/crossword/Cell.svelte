<script lang="ts">
	// Props
	export let value: string;
	export let displayNumber: number;
	export let isSymmetrical: boolean;
	export let hasFocus: boolean;
	export let isHighlighted: boolean;
	export let onInput: (event: Event) => void;
	export let onKeydown: (event: KeyboardEvent) => void;
	export let onFocus: (coords: Coords) => void;
	export let onBlur: (event: Event) => void;

	let inputElement: HTMLInputElement;
	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	const SHARED_INPUT_STYLES = 'caret-transparent cursor-pointer selection:bg-transparent';
	const SHARED_PSEUDO_STYLES = 'focus:bg-cyan-300';

	export const CLASSES = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES} ${SHARED_PSEUDO_STYLES}`;

	$: classes = getStyles(value, isSymmetrical, isHighlighted);

	$: if (hasFocus) {
		inputElement.focus();
	}

	function getStyles(value: string, isSymmetrical: boolean, isHighlighted: boolean) {
		let style = 'bg-gray-100';
		if (value || isSymmetrical) {
			style = 'bg-white';
		}
		if (isHighlighted) {
			style = isSymmetrical ? 'bg-cyan-100' : 'bg-cyan-200';
		}
		return `${CLASSES} ${style}`;
	}
</script>

<td class="relative" role="gridcell">
	<input
		type="text"
		class={classes}
		on:input={onInput}
		on:keydown={onKeydown}
		bind:this={inputElement}
		on:focus={onFocus}
		on:blur={onBlur}
		{value}
	/>
	{#if !!displayNumber}
		<span class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none">
			{displayNumber}
		</span>
	{/if}
</td>
