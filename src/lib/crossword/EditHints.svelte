<script lang="ts">
	import { type EditorPuzzle } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';
	import HintInput from './HintInput.svelte';
	export let puzzle: EditorPuzzle;
	export let onAcrossHintInput: () => void = () => {};
	export let onDownHintInput: () => void = () => {};
	export let showHintErrors: boolean = false;

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
			{#if puzzle.acrossHints.length > 0}
				{#each puzzle.acrossHints as hint}
					<HintInput
						hint={hint.hint}
						answer={hint.answer}
						displayNumber={hint.displayNumber}
						onInput={handleAcrossInput}
						{showHintErrors}
					/>
				{/each}
			{:else}
				<p class="text-red-800 my-4">
					There aren't any <strong>across</strong> words with two or more characters. Consider returning
					to edit this puzzle's grid.
				</p>
			{/if}
		</div>
		<div class="ml-2 w-full">
			<h2 class="font-bold text-left">Down Hints</h2>
			{#if puzzle.downHints.length > 0}
				{#each puzzle.downHints as hint}
					<HintInput
						hint={hint.hint}
						answer={hint.answer}
						displayNumber={hint.displayNumber}
						onInput={handleDownInput}
						{showHintErrors}
					/>
				{/each}
			{:else}
				<p class="text-red-800 my-4">
					There aren't any <strong>down</strong> words with two or more characters. Consider returning
					to edit this puzzle's grid.
				</p>
			{/if}
		</div>
	</div>
{/if}
