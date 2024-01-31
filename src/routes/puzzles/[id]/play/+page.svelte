<!-- PLAY PAGE -->
<script lang="ts">
	import { type ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import type { Puzzle, PuzzleWithId, ID, IdCellTuple } from '$utils/types';
	import { GameStatus } from '$utils/types';
	import Button from '$components/Button.svelte';
	import { debounce, chunkArray, getId } from '$utils/helpers';
	import { GAME_OVER } from '$utils/constants';
	import type { K } from 'vitest/dist/reporters-qc5Smpt5.js';

	export let dynamicPuzzle: Puzzle | null;

	export let data;

	let isComplete = false;
	const incorrectCells: Array<ID> = [];
	const cellIdsInSaveQueueSet: Set<ID> = new Set();

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
			if (dynamicPuzzle) {
				checkIfComplete(dynamicPuzzle);
			}
		}
	});

	const unsubscribe = PuzzleStore.subscribe((data) => {
		if (data) {
			dynamicPuzzle = data;
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	function checkIfComplete(puzzle: Puzzle) {
		isComplete = true;
		Object.values(puzzle.cellMap).forEach((cell, i) => {
			const id: ID = `${cell.x}:${cell.y}`;
			if (!cell.value && cell.correctValue) {
				isComplete = false;
			}
			const isFalseAnswer = cell.correctValue && cell.value !== cell.correctValue;
			const index = incorrectCells.indexOf(id);

			if (isFalseAnswer && index === -1) {
				incorrectCells.push(id);
			} else if (!isFalseAnswer && index >= 0) {
				// mutate the array so the entire page knows when all cells are complete
				incorrectCells.splice(index, 1);
			}
		});
		if (isComplete && incorrectCells.length === 0) {
			puzzle.publishStatus = GAME_OVER;
			PuzzleStore.set(puzzle);
		} else if (isComplete) {
			puzzle.incorrectCells = incorrectCells;
			PuzzleStore.set(puzzle);
		}
	}

	async function saveData() {
		if (dynamicPuzzle === null) {
			return;
		}

		if (cellIdsInSaveQueueSet.size === 0) {
			return;
		}

		// Save endpoint expects data as array of tupples, so make it here.
		// It should be fast since the array will only have 3 or 4 items max.
		const cellsToUpdate: Array<IdCellTuple> = [];
		cellIdsInSaveQueueSet.forEach((id: ID) => {
			cellsToUpdate.push([id, dynamicPuzzle!.cellMap[id]]);
		});
		cellIdsInSaveQueueSet.clear();

		const chunkedData = chunkArray(cellsToUpdate, 5);

		chunkedData.forEach(async (chunk) => {
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			formData.append('id', dynamicPuzzle!._id);
			try {
				const response = await fetch('?/updateCellMap', {
					method: 'POST',
					body: formData
				});

				const result: ActionResult = deserialize(await response.text());
				if (result.type === 'error') {
					throw new Error('Request failed');
				}
			} catch (error) {
				console.error('Error saving chunk:');
			}
		});
	}

	const debounceSaveUpdatedCellMap = debounce(saveData, 300);

	const handleSaveOnInput = (id: ID) => {
		cellIdsInSaveQueueSet.add(id);
		debounceSaveUpdatedCellMap();

		if (dynamicPuzzle) {
			checkIfComplete(dynamicPuzzle);
		}
	};

	const handleSubmit = async (event: Event) => {
		debounceSaveUpdatedCellMap();
	};
</script>

<div>
	{#if puzzle}
		<PuzzleHeading
			puzzleType={puzzle.puzzleType}
			gameStatus={GameStatus.PLAY}
			title={puzzle.title}
		/>

		{#if dynamicPuzzle || puzzle}
			<form
				method="POST"
				action="?/updateCellMap"
				autocomplete="off"
				on:submit|preventDefault={handleSubmit}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword
						puzzle={dynamicPuzzle || puzzle}
						gameStatus={GameStatus.PLAY}
						onInput={handleSaveOnInput}
					/>
				</div>
				<Hints puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.PLAY} />
				<div class="mb-5 flex">
					<div class="mr-5">
						<Button buttonType="submit">Save for later</Button>
					</div>
				</div>
			</form>
		{/if}
	{:else}
		<p>huh.</p>
	{/if}
</div>
