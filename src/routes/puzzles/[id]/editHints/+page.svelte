<script lang="ts">
	// [id]/editHints/page.svelte
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { type ActionResult } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData } from './$types';
	import Banner from '$components/Banner.svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import Hints from '$lib/crossword/EditHints.svelte';
	import Modal from '$components/Modal.svelte';
	import {
		BannerType,
		UserMode,
		type HintDirection,
		type EditorPuzzle,
		type Hint
	} from '$utils/types';
	import { promiseDebounce, chunkArray } from '$utils/helpers';

	export let puzzle: EditorPuzzle;
	export let data;
	export let form: ActionData;

	let errorMessage: string = '';
	let successMessage: string = '';
	let showLinkToPlayPage = false;
	let showModal = false;
	let modalContentType = '';
	let lastSavedAtMessage: string = '';

	const REVERT_TO_GRID = 'REVERT_TO_GRID';
	const PUBLISH_PUZZLE = 'PUBLISH_PUZZLE';

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

	const saveHintData = async (chunkedData: Hint[], id: string, direction: HintDirection) => {
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
					lastSavedAtMessage = result.data.message;
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

	const confirmRevertToGrid = () => {
		showModal = true;
		modalContentType = REVERT_TO_GRID;
	};

	const handleRevertToGrid = async () => {
		const id = puzzle._id;
		const formData = new FormData();
		formData.append('id', id);
		try {
			const response = await fetch('?/returnToGrid', {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'success') {
				goto(`/puzzles/${id}/edit`);
			}
		} catch {
			console.log('error changing status');
		}
	};

	const confirmPublish = () => {
		showModal = true;
		modalContentType = PUBLISH_PUZZLE;
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
				goto(`/?create=true&newPuzzleId=${id}`);
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
	{lastSavedAtMessage}
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
		/>

		<!-- ERROR MESSAGES -->
		{#if errorMessage}
			<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
		{/if}

		{#if showLinkToPlayPage}
			<a href="/puzzles/{puzzle._id}/play" class="text-sky-400">Play {puzzle.title} now?</a>
		{/if}

		<div class="my-6 flex items-center">
			<!-- 	<button
					class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
					>Update save</button
				>-->
			<div class="mr-4">
				<button
					type="button"
					on:click={confirmPublish}
					class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
					>Publish!</button
				>
			</div>
			<div class="mr-4">
				<button
					type="button"
					on:click={confirmRevertToGrid}
					class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
					>Go back to editing grid</button
				>
			</div>
			{#if successMessage}
				<p class="text-gray-400 text-sm">{successMessage}</p>
			{/if}
		</div>
	</form>
{/if}

<div class="bg-gray-100 bottom-0">
	<div class="p-4">
		<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />
	</div>
</div>

<Modal bind:showModal>
	{#if modalContentType === PUBLISH_PUZZLE}
		<p class="mr-4 mb-4">Are you sure you're ready to publish?</p>
		<p class="mr-4 mb-4">
			You won't be able to undo it. Once it's published, it's, like... published. Hundreds of
			millions if not billions of people will see it.
		</p>
		<button
			type="button"
			on:click={handlePublish}
			class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
			>Yes, Publish!</button
		>
	{:else if modalContentType === REVERT_TO_GRID}
		<p class="mb-4">
			You can go back to editing the grid, but you'll lose your hints. Are you sure you want to do
			that?
		</p>
		<button
			type="button"
			on:click={handleRevertToGrid}
			class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
			>Yes, Edit Grid!</button
		>
	{/if}
</Modal>
