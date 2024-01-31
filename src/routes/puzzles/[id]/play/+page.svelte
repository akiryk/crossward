<!-- PLAY PAGE -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import type { Puzzle, PuzzleWithId, ID, DynamicCell } from '$utils/types';
	import { GameStatus } from '$utils/types';
	import Button from '$components/Button.svelte';
	import { debounce, chunkArray, getId } from '$utils/helpers';
	import { GAME_OVER } from '$utils/constants';

	export let dynamicPuzzle: Puzzle | null;

	export let data;

	let isComplete = false;
	const incorrectCells: Array<ID> = [];

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			console.log(puzzle.acrossHints);
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
		const cellsArray: Array<Array<string | DynamicCell>> = Object.entries(dynamicPuzzle.cellMap);
		const chunkedData = chunkArray(cellsArray, 25);

		chunkedData.forEach(async (chunk) => {
			// chunk = [["0:0", cell1], ["0:1", cell2], etc ... ]
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			// @ts-expect-error ts complains that dynamicPuzzle may be null but it cannot be null
			// because we return at the top of saveData if it is
			formData.append('id', dynamicPuzzle._id);
			try {
				const response = await fetch('?/updateCellMap', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Request failed');
				}
			} catch (error) {
				console.error('Error saving chunk:', error);
			}
		});
	}

	const debounceSaveUpdatedCellMap = debounce(saveData, 300);

	const handleSaveOnInput = () => {
		debounceSaveUpdatedCellMap();
		if (dynamicPuzzle) {
			checkIfComplete(dynamicPuzzle);
		}
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
			<form autocomplete="off" on:submit={(event) => event.preventDefault()}>
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
