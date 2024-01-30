<script lang="ts">
	import { GameStatus, type Puzzle } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';

	export let puzzle: Puzzle;
	export let gameStatus: GameStatus;
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
	<div class="flex justify-between">
		<div>
			<h2 class="font-bold text-left">Across Hints</h2>
			{#each puzzle.acrossHints as hint}
				<div class="flex items-center my-2">
					<label
						for={`acrossHintFor${hint?.displayNumber}`}
						class="block text-sm font-medium text-gray-900 dark:text-black mr-5 w-2"
					>
						{hint?.displayNumber}
					</label>
					{#if gameStatus === GameStatus.EDITING_HINTS}
						<input
							type="text"
							placeholder={hint?.answer}
							value={hint?.hint}
							size={50}
							name="hint"
							on:input={(event) => handleAcrossInput(event, hint?.displayNumber)}
							id={`acrossHintFor${hint?.displayNumber}`}
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:border-blue-500 block w-full p-2.5"
						/>
						<div
							class="bg-gray-500 border border-gray-500 text-gray-200 text-sm block w-full p-2.5"
						>
							{hint.answer}
						</div>
					{:else}
						<p>{hint.hint}</p>
					{/if}
				</div>
			{/each}
		</div>
		<div>
			<h2 class="font-bold text-left">Down Hints</h2>
			{#each puzzle.downHints as hint}
				<div class="flex items-center my-2">
					<label
						for={`downHintFor${hint?.displayNumber}`}
						class="block text-sm font-medium text-gray-900 dark:text-black mr-5 w-2"
					>
						{hint?.displayNumber}
					</label>
					{#if gameStatus === GameStatus.EDITING_HINTS}
						<input
							type="text"
							placeholder={`${hint?.answer}`}
							size={50}
							value={hint?.hint}
							name="hint"
							on:input={(event) => handleDownInput(event, hint?.displayNumber)}
							id={`downHintFor${hint?.displayNumber}`}
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						/>
						<div
							class="bg-gray-500 border border-gray-500 text-gray-200 text-sm block w-full p-2.5"
						>
							{hint.answer}
						</div>
					{:else}
						<p>{hint.hint}</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
