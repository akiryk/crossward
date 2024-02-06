<script lang="ts">
	import { type EditorPuzzle } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	import HintInput from './HintInput.svelte';
	export let puzzle: EditorPuzzle;
	export let onAcrossHintInput: () => void = () => {};
	export let onDownHintInput: () => void = () => {};

	function handleAcrossInput(event: Event, displayNumber: number) {
		const hintText = (event.target as HTMLInputElement).value;
		const index = puzzle.acrossHints.findIndex((hint) => hint?.displayNumber === displayNumber);
		puzzle.acrossHints[index].hint = hintText;
		PuzzleStore.set(puzzle);
		onAcrossHintInput();
	}

	function handleDownInput(event: Event, displayNumber: number) {
		const hintText = (event.target as HTMLInputElement).value;
		const index = puzzle.downHints.findIndex((hint) => hint?.displayNumber === displayNumber);
		puzzle.downHints[index].hint = hintText;
		PuzzleStore.set(puzzle);
		onDownHintInput();
	}
</script>

{#if puzzle.acrossHints || puzzle.downHints}
	<div class="flex">
		<div class="mr-2 w-full">
			<h2 class="font-bold text-left">Across Hints</h2>
			{#each puzzle.acrossHints as hint}
				<HintInput
					hint={hint.hint}
					answer={hint.answer}
					displayNumber={hint.displayNumber}
					onInput={handleAcrossInput}
				/>
			{/each}
		</div>
		<div class="ml-2 w-full">
			<h2 class="font-bold text-left">Down Hints</h2>
			{#each puzzle.downHints as hint}
				<HintInput
					hint={hint.hint}
					answer={hint.answer}
					displayNumber={hint.displayNumber}
					onInput={handleDownInput}
				/>
			{/each}
		</div>
	</div>
{/if}
