<script lang="ts">
	import { onDestroy } from 'svelte';
	import GameStore from '../../stores/GameStore';
	import { UserMode, type ID } from '$utils/types';

	export let value: string;
	export let id: ID = '';
	export let displayNumber: number | string = '';
	export let missingValueForSymmetricalCell: boolean = false;
	export let gameOver = false;

	let isTwoLetterWord: boolean = false;

	// Game Store
	const unsubscribeGameStore = GameStore.subscribe((data) => {
		if (UserMode.PREVIEW && data.twoLetterWordIds.includes(id)) {
			isTwoLetterWord = true;
		}
	});

	onDestroy(() => {
		unsubscribeGameStore();
	});

	const SHARED_CELL_FONT_STYLES = 'text-center text-xl uppercase';
	const SHARED_CELL_STYLES =
		'w-10 h-10 outline outline-1  border-none flex justify-center items-center relative select-none';
	const COMBINED_STYLES = `${SHARED_CELL_STYLES} ${SHARED_CELL_FONT_STYLES}`;
	let bgColor;
	if (gameOver) {
		bgColor = value ? 'bg-blue-100' : 'bg-black';
	} else if (isTwoLetterWord) {
		bgColor = 'bg-red-200';
	} else {
		bgColor = missingValueForSymmetricalCell ? 'bg-red-500' : value ? 'bg-white' : 'bg-black';
	}
	let borderColor = gameOver ? 'outline-blue-400' : 'outline-gray-400';

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
