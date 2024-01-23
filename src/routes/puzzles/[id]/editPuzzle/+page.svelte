<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import type { Puzzle } from '$utils/types';
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
					return async ({ result }) => {
						// @ts-ignore
						if (result?.data?.headers?.location) goto(result.data.headers.location);
					};
				}}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword puzzle={dynamicPuzzle || puzzle} />
				</div>
				<div class="mb-5 flex">
					<Button buttonType="submit">Save for later</Button>
					<button
						formaction="?/createHints"
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
						>Make Hints</button
					>
				</div>
			</form>
		{/if}

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		{#if form?.success}
			<p>You did it successfully.</p>
		{/if}

		<hr class="my-10" />
		<div class="flex">
			<div class="mr-auto">
				<form method="POST" action="?/updateTitle" use:enhance>
					<input type="hidden" name="originalTitle" value={puzzle.title} />
					<label>
						Edit the title:
						<input
							type="text"
							placeholder={puzzle.title}
							name="title"
							value={form?.title ?? ''}
							class="border-solid border-2 border-indigo-600 p-2"
						/></label
					>
					<Button buttonType="submit" style="primary">Update</Button>
				</form>
			</div>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={puzzle._id} />
				Danger Zone!
				<Button buttonType="submit" style="primary">Delete</Button>
			</form>
		</div>
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
