<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import Button from '$components/Button.svelte';
	import Banner from '$components/Banner.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { BannerType, GameStatus, ServerErrorType, type Puzzle } from '$utils/types';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;
	let errorMessage: string = '';
	let successMessage: string = '';
	let errorType: string = '';

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
		{#if dynamicPuzzle || puzzle}
			<div class="mb-5">
				<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDITING_HINTS} />
			</div>
			<form
				method="POST"
				action={'?/updateHints'}
				autocomplete="off"
				use:enhance={(a) => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async ({ result }) => {
						if (result?.status === 200) {
							errorMessage = '';

							switch (result?.data?.successType) {
								case 'updated':
									successMessage = `The puzzle ${puzzle.title} is saved!`;
									break;
								case 'published':
									successMessage = `The puzzle ${puzzle.title} is published!`;
									break;
								default:
									successMessage = `The puzzle ${puzzle.title} is saved!`;
							}
						}
						if (result?.status && result.status >= 400) {
							successMessage = '';
							if ('data' in result && typeof result.data?.message === 'string') {
								errorMessage = result.data.message;
								if (result.data.errorType !== ServerErrorType.UPDATE_TITLE_DB_ERROR) {
									errorType = 'hint';
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

				<!-- ERROR MESSAGES -->
				{#if errorMessage && errorType === 'hint'}
					<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
				{/if}

				<!-- SUCCESS MESSAGES -->
				{#if successMessage}
					<Banner message={successMessage} bannerType={BannerType.IS_SUCCESS} />
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
