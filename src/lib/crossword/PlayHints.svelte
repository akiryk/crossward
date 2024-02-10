<script lang="ts">
	import { type PlayerPuzzle, Direction } from '$utils/types';
	import GameStore from '../../stores/GameStore';
	import PlayHintRow from './PlayHintRow.svelte';
	export let puzzle: PlayerPuzzle;

	const DOWN = 'DOWN';
	const ACROSS = 'ACROSS';

	let acrossDisplay: number | null;
	let downDisplay: number | null;

	function handleClick({ displayNumber, direction }: { displayNumber: number; direction: string }) {
		// highlight the selected hint
		if (direction === DOWN) {
			acrossDisplay = null;
			downDisplay = displayNumber;
		} else {
			downDisplay = null;
			acrossDisplay = displayNumber;
		}
		// set the grid direction based on hint direction
		// The highlighted cells will automatically update once we set the focused cell
		const puzzleCell = Object.values(puzzle.cellMap).find(
			(cell) => cell.displayNumber === displayNumber
		);
		const gridDirection = direction === DOWN ? Direction.GO_DOWN : Direction.GO_RIGHT;
		if (puzzleCell) {
			GameStore.update((current) => {
				return {
					...current,
					cellWithFocusId: puzzleCell.id,
					gridDirection
				};
			});
		}
	}
</script>

{#if puzzle.acrossHints || puzzle.downHints}
	<div class="flex flex-1 max-w-xl">
		<div class="mr-8 flex-1">
			<h2 class="font-bold text-left mb-3">Across Hints</h2>
			{#each puzzle.acrossHints as hint}
				<PlayHintRow
					direction={ACROSS}
					hint={hint.hint}
					displayNumber={hint.displayNumber}
					onClick={handleClick}
					isSelected={acrossDisplay === hint.displayNumber}
				/>
			{/each}
		</div>
		<div class="ml-2 flex-1">
			<h2 class="font-bold text-left mb-3">Down Hints</h2>
			{#each puzzle.downHints as hint}
				<PlayHintRow
					direction={DOWN}
					hint={hint.hint}
					displayNumber={hint.displayNumber}
					onClick={handleClick}
					isSelected={downDisplay === hint.displayNumber}
				/>
			{/each}
		</div>
	</div>
{/if}
