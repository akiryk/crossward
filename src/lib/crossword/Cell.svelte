<script lang="ts">
	import { GameStatus } from '$utils/types';

	// Props
	export let value: string;
	export let displayNumber: number;
	export let hasFocus: boolean;
	export let gameStatus: GameStatus;
	export let isHighlighted: boolean;
	export let isSymmetrical: boolean = false;
	export let onInput: (event: Event) => void;
	export let onKeydown: (event: KeyboardEvent) => void;
	export let onFocus: (event: Event) => void;
	export let onBlur: (event: Event) => void;
	export let onClick: (event: MouseEvent) => void;
	export let isFalseValue = false;
	export let isGameOver = false;

	let inputElement: HTMLInputElement;
	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none';
	const SHARED_INPUT_STYLES = 'caret-transparent cursor-pointer selection:bg-transparent';
	const SHARED_PSEUDO_STYLES = 'focus:bg-cyan-300';

	export const CLASSES = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES} ${SHARED_PSEUDO_STYLES}`;

	$: classes = getStyles(value, isSymmetrical, isHighlighted, isFalseValue, isGameOver);

	$: if (hasFocus) {
		inputElement.focus();
	}

	function getStyles(
		value: string,
		isSymmetrical: boolean,
		isHighlighted: boolean,
		isFalseValue: boolean,
		isGameOver: boolean
	) {
		let style = 'bg-gray-300';
		if (gameStatus === GameStatus.PLAY || value || isSymmetrical) {
			style = 'bg-white';
		}
		switch (true) {
			case isFalseValue:
				style = 'bg-red-300';
				break;
			case isGameOver:
				style = 'bg-blue-100 outline-blue-400';
				break;
			case isHighlighted:
				style = isSymmetrical ? 'bg-cyan-100' : 'bg-cyan-200';
				break;
			default:
				style = 'bg-white';
		}

		return `${CLASSES} ${style}`;
	}
</script>

<td class="relative" role="gridcell">
	<input
		type="text"
		class={classes}
		name="cell"
		on:input={onInput}
		on:keydown={onKeydown}
		bind:this={inputElement}
		on:focus={onFocus}
		on:blur={onBlur}
		bind:value
		on:click={onClick}
	/>
	{#if !!displayNumber}
		<span class="absolute left-0.5 top-px text-xs text-slate-600 pointer-events-none">
			{displayNumber}
		</span>
	{/if}
</td>
