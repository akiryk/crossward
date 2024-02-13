<script lang="ts">
	import { UserMode } from '$utils/types';

	// Props
	export let value: string;
	export let displayNumber: number;
	export let hasFocus: boolean;
	export let userMode: UserMode;
	export let isHighlighted: boolean;
	export let isSymmetrical: boolean = false;
	export let isWarning: boolean = false;
	export let isError: boolean = false;
	export let isBlack: boolean = false;
	export let onInput: (event: Event) => void;
	export let onKeydown: (event: KeyboardEvent) => void;
	export let onFocus: (event: Event) => void;
	export let onBlur: (event: Event) => void;
	export let onClick: (event: MouseEvent) => void;
	export let isGameOver = false;
	export let tabindex: string = '-1';

	let inputElement: HTMLInputElement;
	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES = 'w-10 h-10 outline outline-1 outline-gray-400 border-none p-0';
	const SHARED_INPUT_STYLES = 'caret-transparent cursor-pointer selection:bg-transparent';
	const SHARED_PSEUDO_STYLES = 'focus:bg-cyan-300 focus:ring-gray-400';

	export const CLASSES = `${SHARED_INPUT_STYLES} ${SHARED_CELL_FONT_STYLES} ${SHARED_CELL_STYLES} ${SHARED_PSEUDO_STYLES}`;

	$: classes = getStyles({
		value,
		isSymmetrical,
		isHighlighted,
		isGameOver,
		isWarning,
		isError,
		isBlack
	});

	$: if (hasFocus) {
		inputElement?.focus();
	}

	function getStyles({
		value,
		isSymmetrical,
		isHighlighted,
		isGameOver,
		isWarning,
		isError,
		isBlack
	}: {
		value: string;
		isSymmetrical: boolean;
		isHighlighted: boolean;
		isGameOver: boolean;
		isWarning: boolean;
		isError: boolean;
		isBlack: boolean;
	}) {
		let style = 'bg-gray-300';
		if (userMode === UserMode.PLAY || value || isSymmetrical) {
			style = 'bg-white';
		}
		switch (true) {
			case isError:
				if (isHighlighted) {
					style = 'bg-red-600';
				} else {
					style = 'bg-red-900';
				}
				break;
			case isWarning:
				if (isHighlighted) {
					style = 'bg-yellow-400';
				} else {
					style = 'bg-yellow-500';
				}
				break;
			case isGameOver:
				style = 'bg-blue-100 outline-blue-400';
				break;
			case isHighlighted:
				if (isBlack) {
					style = 'bg-gray-700';
				} else {
					style = isSymmetrical || userMode === UserMode.PLAY ? 'bg-cyan-100' : 'bg-gray-200';
				}
				break;
			case isBlack:
				style = 'bg-black';
				break;
		}

		return `${CLASSES} ${style}`;
	}
</script>

<td class="relative" role="gridcell">
	<input
		type="text"
		class={classes}
		name="cell"
		{tabindex}
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
