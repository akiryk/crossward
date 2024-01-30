<!-- PLAY PAGE -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import type { Puzzle, PuzzleWithId, Cell, DynamicCell } from '$utils/types';
	import { GameStatus } from '$utils/types';
	import Button from '$components/Button.svelte';
	import { debounce, chunkArray, getId } from '$utils/helpers';

	export let dynamicPuzzle: Puzzle | null;

	export let data;

	const incompleteCells: Array<DynamicCell> | Array<Cell> = [];

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
			checkIfComplete(puzzle);
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

	function checkIfComplete(puzzle: Puzzle | PuzzleWithId) {
		Object.values(puzzle.cellMap).forEach((cell) => {
			if (cell.correctValue && cell.value !== cell.correctValue) {
				const id: string = cell.id;
				// @ts-expect-error id is a string
				if (!incompleteCells.includes(id)) incompleteCells.push(id);
			}
		});
		console.log(incompleteCells);
		if (incompleteCells.length === 0) {
			console.log('won!');
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
