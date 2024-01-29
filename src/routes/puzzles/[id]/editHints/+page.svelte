<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import Banner from '$components/Banner.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { BannerType, GameStatus, ServerErrorType, type Puzzle } from '$utils/types';
	import { debounce, saveHintData, chunkArray } from '$utils/helpers';

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

	const debounceSave = debounce(saveHintData);

	const handleAcrossHintInput = () => {
		if (dynamicPuzzle === null) {
			return;
		}
		const chunkedData = chunkArray(dynamicPuzzle.acrossHints, 5);
		debounceSave(chunkedData, dynamicPuzzle._id, 'across');
	};

	const handleDownHintInput = () => {
		if (dynamicPuzzle === null) {
			return;
		}
		const chunkedData = chunkArray(dynamicPuzzle.downHints, 5);
		debounceSave(chunkedData, dynamicPuzzle._id, 'down');
	};

	const handleSave = () => {
		handleAcrossHintInput();
		handleDownHintInput();
	};

	const handlePublish = async () => {
		// handleSave();
		const formData = new FormData();
		formData.append('id', puzzle._id);
		try {
			const response = await fetch(`?/publish`, {
				method: 'POST',
				body: puzzle._id,
				headers: {
					Accept: 'application/json'
				}
			});

			console.log(response);
			if (!response.ok) {
				throw new Error('Request failed');
			}
		} catch (error) {
			console.error('Error saving chunk:', error);
		}
	};
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
			<form autocomplete="off" on:submit={(event) => event.preventDefault()}>
				<input type="hidden" name="id" value={dynamicPuzzle?._id} />
				<input
					type="hidden"
					name="acrossHints"
					value={JSON.stringify(dynamicPuzzle?.acrossHints)}
				/>
				<input type="hidden" name="downHints" value={JSON.stringify(dynamicPuzzle?.downHints)} />
				<Hints
					puzzle={dynamicPuzzle || puzzle}
					onAcrossHintInput={handleAcrossHintInput}
					onDownHintInput={handleDownHintInput}
					gameStatus={GameStatus.EDITING_HINTS}
				/>

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
						<button
							type="button"
							on:click={handleSave}
							class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
							>Save for later</button
						>
					</div>
					<button
						type="button"
						on:click={handlePublish}
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
