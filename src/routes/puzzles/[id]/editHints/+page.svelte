<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto, invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { type ActionResult } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';
	import Banner from '$components/Banner.svelte';
	import Button from '$components/Button.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { BannerType, GameStatus, type HintDirection, type Puzzle } from '$utils/types';
	import { promiseDebounce, chunkArray } from '$utils/helpers';

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

	const saveHintData = async (chunkedData: any[], id: string, direction: HintDirection) => {
		chunkedData.forEach(async (chunk) => {
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			formData.append('direction', direction);
			formData.append('id', id);
			try {
				const response = await fetch(`?/updateHints`, {
					method: 'POST',
					body: formData
				});
				const result: ActionResult = deserialize(await response.text());
				if (result.type === 'success') {
					successMessage = result.data?.message;
					// rerun all `load` functions, following the successful update
					await invalidateAll();
				} else if (result.type === 'failure') {
					errorMessage = result.data?.message;
				}
			} catch (error) {
				console.error('Error saving chunk:', error);
			}
		});
	};

	const debounceSave = promiseDebounce(saveHintData);

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

	const handleSaveHints = () => {
		handleAcrossHintInput();
		handleDownHintInput();
	};

	const handlePublish = async () => {
		await handleSaveHints();
		const id = puzzle._id;
		const formData = new FormData();
		formData.append('id', id);
		try {
			const response = await fetch('?/publish', {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success') {
				successMessage = result.data?.message;
				// rerun all `load` functions, following the successful update
				await invalidateAll();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.message;
			}
		} catch (error) {
			errorMessage = 'Please try again soon.';
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
			<form
				method="POST"
				action={'?/publish'}
				autocomplete="off"
				on:submit|preventDefault={handleSaveHints}
			>
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
				{#if errorMessage}
					<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
				{/if}

				<!-- SUCCESS MESSAGES -->
				{#if successMessage}
					<Banner message={successMessage} bannerType={BannerType.IS_SUCCESS} />
				{/if}

				<div class="mb-5 flex">
					<button
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Update save</button
					>
					<button
						type="button"
						on:click={handlePublish}
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Publish The Puzzle!</button
					>
					{#if form?.error}
						<p>Error</p>
					{/if}
				</div>
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
