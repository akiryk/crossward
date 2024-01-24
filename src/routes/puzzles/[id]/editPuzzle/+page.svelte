<script lang="ts">
	// [id]/editPuzzle/page.svelte
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import { GameStatus, type Puzzle } from '$utils/types';
	import Button from '$components/Button.svelte';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;

	$: ({ puzzle, isCreateSuccess } = data);

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
			isCreateSuccess={isCreateSuccess ? true : false}
			puzzleType={puzzle.puzzleType}
			gameStatus={GameStatus.EDIT_GRID}
			title={puzzle.title}
		/>
		{#if dynamicPuzzle || puzzle}
			<form
				method="POST"
				action={'?/updateCellMap'}
				use:enhance={() => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async ({ result }) => {
						// @ts-ignore
						if (result?.data?.headers?.location) goto(result.data.headers.location);
					};
				}}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="cellsArray" value={JSON.stringify(dynamicPuzzle?.cellsArray)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDIT_GRID} />
				</div>
				<div class="mb-5 flex">
					<div class="mr-5">
						<Button buttonType="submit">Save for later</Button>
					</div>
					<button
						formaction="?/createHints"
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Make Hints</button
					>
				</div>
			</form>
		{/if}

		<hr class="my-10" />

		<EditPuzzleTitle
			error={form?.error}
			success={form?.success}
			title={form?.title || puzzle.title}
			id={puzzle._id}
		/>
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
