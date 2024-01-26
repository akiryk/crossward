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
	import { GameStatus } from '$utils/types';

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
					<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.PLAY} />
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
