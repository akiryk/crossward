<script lang="ts">
	// [id]/editGrid/page.svelte
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import { GameStatus, BannerType, ServerErrorType, type Puzzle } from '$utils/types';
	import Button from '$components/Button.svelte';
	import Banner from '$components/Banner.svelte';

	export let dynamicPuzzle: Puzzle | null;

	export let data;
	export let form;

	let errorMessage: string = '';
	let successMessage: string = '';
	let isPreview = false;

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

	async function saveData() {
		try {
			const formData = new FormData(document.querySelector('form'));

			await fetch('?/updateCellMap', {
				method: 'POST',
				body: formData
			});

			// if (response.ok) {
			// 	console.log('Data saved successfully!');
			// } else {
			// 	throw new Error('Failed to save data.');
			// }
		} catch (error) {
			console.error('Error saving data:', error.message);
		}
	}

	const handleSaveOnInput = () => {
		setTimeout(() => {
			saveData();
		}, 100);
	};

	const handleOnPreview = () => {
		isPreview = true;
	};

	const handleOffPreview = () => {
		isPreview = false;
	};

	$: showIsPreview = isPreview;
</script>

<div>
	{#if puzzle}
		<PuzzleHeading
			isCreateSuccess={isCreateSuccess ? true : false}
			puzzleType={puzzle.puzzleType}
			gameStatus={GameStatus.EDITING_CELLS}
			title={puzzle.title}
		/>
		{#if dynamicPuzzle || puzzle}
			<form
				id="crosswordPuzzleId"
				method="POST"
				action={'?/updateCellMap'}
				autocomplete="off"
				use:enhance={() => {
					// This async noop is necessary to ensure that the puzzle displays values after
					// update. I'm not sure why but suspect it may be that when you provide an async
					// function to use:enhance, it allows asynchronous operations to complete before
					// proceeding with subsequent actions
					return async ({ result }) => {
						if (result?.status === 200) {
							errorMessage = '';
							successMessage = `The puzzle ${puzzle.title} is saved!`;
						}
						if (result?.status && result.status >= 400) {
							successMessage = '';
							if ('data' in result && typeof result.data?.message === 'string') {
								errorMessage = result.data.message;
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
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword
						puzzle={dynamicPuzzle || puzzle}
						gameStatus={isPreview ? GameStatus.PREVIEW : GameStatus.EDITING_CELLS}
						onInput={handleSaveOnInput}
						{showIsPreview}
					/>
				</div>
				<!-- ERROR MESSAGES -->
				{#if errorMessage}
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
						formaction="?/createHints"
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Make Hints</button
					>
					<button
						type="button"
						on:mousedown={handleOnPreview}
						on:mouseup={handleOffPreview}
						on:mouseout={handleOffPreview}
						on:blur={handleOffPreview}
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Preview</button
					>
				</div>
			</form>
		{/if}

		<hr class="my-10" />

		<EditPuzzleTitle success={form?.success} title={form?.title || puzzle.title} id={puzzle._id} />
	{:else}
		<p>huh.</p>
	{/if}
</div>
