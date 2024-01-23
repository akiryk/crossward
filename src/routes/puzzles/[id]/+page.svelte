<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../stores/PuzzleStore';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import type { Puzzle } from '$utils/types';
	import Button from '$components/Button.svelte';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;

	$: ({ puzzle, isEditing, isCreateSuccess } = data);

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
		{#if isCreateSuccess}
			<p class="text-lime-600 font-medium mb-3">
				Yay, you created a new {puzzle.puzzleType} puzzle!
			</p>
		{/if}

		<h2 class="font-medium text-xl mb-3">{puzzle.title}</h2>
		{#if dynamicPuzzle || puzzle}
			<form
				method="POST"
				action={'?/updateCellMap'}
				use:enhance={() => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async () => {};
				}}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword puzzle={dynamicPuzzle || puzzle} isEditing={true} />
				</div>
				<div class="mb-5">
					<Button buttonType="submit">Save</Button>
				</div>
			</form>
		{/if}
	{:else}
		<h2>Gee, something went wrong.</h2>
		<p>
			We can't seem to find the puzzle you requested. You might want to return to the <a
				class="text-sky-600"
				href="/puzzles">puzzles page</a
			> and try another.
		</p>
	{/if}
</div>
