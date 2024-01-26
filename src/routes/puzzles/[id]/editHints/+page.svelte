<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import Button from '$components/Button.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { GameStatus, type Puzzle } from '$utils/types';
	import { PUBLISHED, SERVER_ERROR_TYPES } from '$utils/constants';
	import ErrorMessage from '$components/ErrorMessage.svelte';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;
	let errorMessage: string = '';
	let successMessage: string = '';
	let publishStatus = '';
	let errorType = '';

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
			gameStatus={GameStatus.EDITING_HINTS}
			title={puzzle.title}
		/>
		{#if publishStatus === PUBLISHED && successMessage}
			<div
				class="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
				role="alert"
			>
				<svg
					class="flex-shrink-0 inline w-4 h-4 me-3"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path
						d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
					/>
				</svg>
				<span class="sr-only">Info</span>
				<div>
					<span class="font-medium">Success: </span>
					{successMessage}.
				</div>
			</div>
		{/if}
		{#if dynamicPuzzle || puzzle}
			<div class="mb-5">
				<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDITING_HINTS} />
			</div>
			<form
				method="POST"
				action={'?/saveHints'}
				use:enhance={(a) => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async ({ result }) => {
						if (result?.status === 200) {
							errorMessage = '';
							successMessage = 'Yes!!! You have finished making this puzzle';
							publishStatus = PUBLISHED;
						}
						if (result?.status && result.status >= 400) {
							successMessage = '';
							if ('data' in result && typeof result.data?.message === 'string') {
								errorMessage = result.data.message;

								if (result.data.errorType && typeof result.data.errorType === 'string') {
									errorType = result.data.errorType; // types are 'hint'
								}
							} else {
								errorMessage = 'Sorry, that may not have worked. ';
							}
						} else {
							errorMessage = '';
						}
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
				<Hints puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDITING_HINTS} />
				{#if errorMessage && (errorType === SERVER_ERROR_TYPES.PUBLISH_INCOMPLETE_HINTS || errorType === SERVER_ERROR_TYPES.PUBLISH_MISSING_DATA || errorType === SERVER_ERROR_TYPES.PUBLISH_MISSING_DATA)}
					<ErrorMessage {errorMessage} />
				{/if}
				<div class="mb-5 flex">
					<div class="mr-5">
						<Button buttonType="submit">Save for later</Button>
					</div>
					<button
						formaction="?/publish"
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Publish</button
					>
				</div>
				{#if form?.error}
					<p>Error</p>
				{/if}
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
		<p>huh.</p>
	{/if}
</div>
