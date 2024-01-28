<!-- PLAY PAGE -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import type { Puzzle } from '$utils/types';
	import Button from '$components/Button.svelte';
	import { GameStatus, type DynamicCell } from '$utils/types';
	import { debounce, chunkArray } from '$utils/helpers';

	export let dynamicPuzzle: Puzzle | null;

	export let data;

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
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

	const debouceSaveUpdatedCellMap = debounce(saveData, 300);

	const handleSaveOnInput = () => {
		debouceSaveUpdatedCellMap();
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
				action={'?/saveGame'}
				autocomplete="off"
				use:enhance={() => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async ({ result }) => {
						// @ts-ignore
					};
				}}
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
