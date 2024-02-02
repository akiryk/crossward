<script lang="ts">
	// [id]/editHints/page.svelte
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { type ActionResult } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData } from './$types';
	import Banner from '$components/Banner.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/Hints.svelte';
	import { BannerType, UserMode, type HintDirection, type EditorPuzzle } from '$utils/types';
	import { promiseDebounce, chunkArray } from '$utils/helpers';

	export let puzzle: EditorPuzzle;
	export let data;
	export let form: ActionData;

	let errorMessage: string = '';
	let successMessage: string = '';

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
		}
	});

	const unsubscribe = PuzzleStore.subscribe((data) => {
		if (data) {
			puzzle = data;
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
				if (result.type === 'failure') {
					errorMessage = result.data?.message;
				}
				if (result.type === 'success' && result?.data?.message) {
					successMessage = result.data.message;
				}
			} catch (error) {
				console.error('Error saving chunk:', error);
			}
		});
	};

	const debounceSave = promiseDebounce(saveHintData);

	const handleAcrossHintInput = () => {
		if (puzzle === null) {
			return;
		}
		const chunkedData = chunkArray(puzzle.acrossHints, 5);
		debounceSave(chunkedData, puzzle._id, 'across');
	};

	const handleDownHintInput = () => {
		if (puzzle === null) {
			return;
		}
		const chunkedData = chunkArray(puzzle.downHints, 5);
		debounceSave(chunkedData, puzzle._id, 'down');
	};

	const handleSaveHints = () => {
		handleAcrossHintInput();
		handleDownHintInput();
	};

	const handlePublish = async () => {
		if (!puzzle) {
			return;
		}
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

<PuzzleHeading
	puzzleType={puzzle.puzzleType}
	userMode={UserMode.EDITING_HINTS}
	title={puzzle.title}
/>
{#if puzzle || puzzle}
	<div class="mb-5">
		<Crossword puzzle={puzzle || puzzle} userMode={UserMode.EDITING_HINTS} />
	</div>
	<form
		method="POST"
		action={'?/publish'}
		autocomplete="off"
		on:submit|preventDefault={handleSaveHints}
	>
		<input type="hidden" name="id" value={puzzle?._id} />
		<input type="hidden" name="acrossHints" value={JSON.stringify(puzzle?.acrossHints)} />
		<input type="hidden" name="downHints" value={JSON.stringify(puzzle?.downHints)} />
		<Hints
			puzzle={puzzle || puzzle}
			onAcrossHintInput={handleAcrossHintInput}
			onDownHintInput={handleDownHintInput}
			userMode={UserMode.EDITING_HINTS}
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
		</div>
	</form>
{/if}

<hr class="my-10" />

<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />
