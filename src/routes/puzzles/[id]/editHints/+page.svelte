<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import ErrorMessage from '$lib/crossword/ErrorMessage.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { GameStatus, type Puzzle } from '$utils/types';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;

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
			gameStatus={GameStatus.EDIT_HINTS}
			title={puzzle.title}
		/>

		{#if dynamicPuzzle || puzzle}
			<div class="mb-5">
				<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDIT_HINTS} />
			</div>
			<form
				method="POST"
				action={'?/saveHints'}
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
				<input type="hidden" name="id" value={dynamicPuzzle?._id} />
				<input
					type="hidden"
					name="acrossHints"
					value={JSON.stringify(dynamicPuzzle?.acrossHints)}
				/>
				<input type="hidden" name="downHints" value={JSON.stringify(dynamicPuzzle?.downHints)} />
				<Hints
					downHints={dynamicPuzzle ? dynamicPuzzle.downHints : puzzle.downHints}
					acrossHints={dynamicPuzzle ? dynamicPuzzle.acrossHints : puzzle.acrossHints}
				/>
			</form>
		{/if}

		<hr class="my-10" />

		<EditPuzzleTitle
			error={form?.error}
			success={form?.success}
			title={puzzle.title}
			id={puzzle._id}
		/>
	{:else}
		<ErrorMessage />
	{/if}
</div>
