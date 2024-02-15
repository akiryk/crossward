<script lang="ts">
	// [id]/edit/page.svelte
	import { get } from 'svelte/store';
	import { type ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { clickOutside } from '$utils/useClickOutside';
	import type { LoadData } from './+page.server.ts';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import GameStore from '../../../../stores/GameStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import {
		UserMode,
		BannerType,
		type EditorPuzzle,
		type CellMapArray,
		type ID,
		type GameContext,
		type PublishStatus
	} from '$utils/types';
	import Banner from '$components/Banner.svelte';
	import Modal from '$components/Modal.svelte';
	import Hints from '$lib/crossword/EditHints.svelte';
	import { promiseDebounce, chunkArray } from '$utils/helpers';
	import type { ActionData } from './$types.js';
	import {
		findWordsThatAreTooShort,
		getActiveCellIdsFromCellMap,
		findIfPuzzleFailsRotationalSymmetry,
		togglePreview,
		saveData,
		validateGridIsReadyForHints,
		createHints
	} from './editGridHelpers';
	import { saveAcrossHintInput, saveDownHintInput, revertToGrid, publish } from './editHintHelpers';
	import {
		MISSING_SYMMETRY,
		TWO_LETTER_WORDS,
		PUZZLE_INCOMPLETE,
		EDIT_PUZZLE,
		REVERT_TO_GRID,
		PUBLISH_PUZZLE
	} from '$utils/constants';

	export let puzzle: EditorPuzzle;
	export let data: LoadData;
	export let isCreateSuccess: boolean;

	export let form: ActionData;

	let errorMessage: string = '';
	let lastSavedAtMessage: string = '';
	let isPreview = false;
	let showModal = false;
	let modalContentType = '';
	let percentOfCompleteCells: string;
	let userMode: UserMode;
	let showLinkToPlayPage = false;
	let successMessage: string = '';

	$: ({ puzzle, isCreateSuccess } = data);

	$: onMount(() => {
		if (puzzle) {
			userMode =
				puzzle.publishStatus === EDIT_PUZZLE ? UserMode.EDITING_CELLS : UserMode.EDITING_HINTS;
			PuzzleStore.set(puzzle);
			const cellMap = puzzle.cellMap;
			const activeCellIds: Array<ID> = getActiveCellIdsFromCellMap(cellMap);

			GameStore.update((current) => {
				return {
					...current,
					activeCellIds
				};
			});
		}
	});

	// Store Subscriptions

	const unsubscribePuzzleStore = PuzzleStore.subscribe((data) => {
		if (data) {
			puzzle = data;
		}
	});

	onDestroy(() => {
		unsubscribePuzzleStore();
	});

	const handleTogglePreview = (event: Event) => {
		isPreview = togglePreview({
			event,
			puzzle
		});
	};

	function handleClickOutside() {
		GameStore.update((current) => ({
			...current,
			highlightedCellIds: []
		}));
	}

	async function handleValidateGridIsReadyForHints() {
		const validation = await validateGridIsReadyForHints(puzzle);
		if (validation.showModal && validation.modalContentType) {
			showModal = true;
			modalContentType = validation.modalContentType;
			percentOfCompleteCells = validation.percentOfCompleteCells || '';
			return;
		}
		saveGridAndCreateHints();
	}

	const promiseDebounceSave = promiseDebounce(saveData);

	const handleSaveCellMap = async () => {
		if (!puzzle) {
			return;
		}
		const formData = new FormData();
		formData.append('cellMap', JSON.stringify(puzzle.cellMap));
		formData.append('id', puzzle._id);

		// If we are previewing the puzzle, update the warnings as user types
		if (isPreview) {
			const { activeCellIds } = get(GameStore);
			const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
			GameStore.update((current) => ({
				...current,
				twoLetterWordIds
			}));
		}

		const result = (await promiseDebounceSave(formData)) as {
			errorMessage: string;
			successMessage: string;
		} | null;
		lastSavedAtMessage = result?.successMessage || '';
		errorMessage = result?.errorMessage || '';
	};

	const handleAcrossHintInput = async () => {
		await saveAcrossHintInput(puzzle);
	};

	const handleDownHintInput = async () => {
		await saveDownHintInput(puzzle);
	};

	const handleSaveHints = async () => {
		await handleDownHintInput();
		await handleAcrossHintInput();
	};

	// Enable the event handler to call a function
	// that doesn't accept event:Event as a parameter
	const handleSubmit = () => {
		handleSaveCellMap();
	};

	// Enable the event handler to call a function
	// that doesn't accept event:Event as a parameter
	const handleInput = () => {
		handleSaveCellMap();
		if (userMode === UserMode.EDITING_HINTS) {
			handleSaveHints();
		}
	};

	const handleRevertToGrid = () => {
		revertToGrid(puzzle);
	};

	const handlePublish = async () => {
		const response = await publish(puzzle);
		if (response.success) {
			goto(`/?create=true&newPuzzleId=${puzzle._id}`);
		}
		if (response.error) {
			errorMessage = response.error;
		}
	};

	const confirmRevertToGrid = () => {
		showModal = true;
		modalContentType = REVERT_TO_GRID;
	};

	const confirmPublish = () => {
		showModal = true;
		modalContentType = PUBLISH_PUZZLE;
	};

	async function saveGridAndCreateHints() {
		await handleSaveCellMap();
		const result = await createHints(puzzle);
		if (result?.success) {
			userMode = UserMode.EDITING_HINTS;
			puzzle.acrossHints = result.data.acrossHints;
			puzzle.downHints = result.data.downHints;
			puzzle.cellMap = result.data.cellMap;
			puzzle.cellRows = result.data.cellRows;
			PuzzleStore.set(puzzle);
		}
	}
</script>

<PuzzleHeading
	isCreateSuccess={isCreateSuccess ? true : false}
	puzzleType={puzzle.puzzleType}
	{userMode}
	title={puzzle.title}
	{lastSavedAtMessage}
/>
{#if puzzle}
	<form
		method="POST"
		action="?/updateCellMap"
		autocomplete="off"
		on:submit|preventDefault={handleSubmit}
	>
		<input type="hidden" name="cellMap" value={JSON.stringify(puzzle?.cellMap)} />
		<input type="hidden" name="id" value={puzzle._id} />
		<div class="mb-10 w-fit flex" use:clickOutside={{ callback: handleClickOutside }}>
			<Crossword {isPreview} {userMode} onInput={handleInput} />
		</div>
		<!-- ERROR MESSAGES -->
		{#if errorMessage}
			<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
		{/if}
		{#if userMode === UserMode.EDITING_CELLS}
			<div class="mb-5 flex items-center">
				<button
					class="text-gray-900 mr-10 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
					>Update save</button
				>
				<button
					type="button"
					on:click={handleValidateGridIsReadyForHints}
					class="text-gray-900 mr-10 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
					>Make Hints</button
				>

				<label for="togglePreview">
					<input id="togglePreview" type="checkbox" on:change={handleTogglePreview} />
					Toggle Preview Mode
				</label>
			</div>
		{/if}
	</form>
{/if}
{#if userMode === UserMode.EDITING_HINTS}
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
			{puzzle}
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

<hr class="my-10" />
<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />
<Modal bind:showModal>
	{#if modalContentType === MISSING_SYMMETRY}
		<h2 class="mr-4 mb-4">Rotational symmetry, anyone?</h2>
		<p class="mr-4 mb-4">
			This puzzle doesn't have rotational symmetry. You can still publish it, but it might not look
			up-to-standards.
		</p>
		<p class="mr-4 mb-4">
			Try enabling "toggle preview mode" to identify problem areas (red cells are for incomplete
			symmetry and pink cells are for two-letter words)
		</p>
	{:else if modalContentType === TWO_LETTER_WORDS}
		<p class="mb-4">
			Your puzzle has one or more two-letter words, which isn't really super cool. You can still do
			it, but. Just saying.
		</p>
	{:else if modalContentType === PUZZLE_INCOMPLETE}
		<p class="mb-4">Lazy. Bones.</p>
		<p class="mb-4">
			Only about {percentOfCompleteCells}% of cells in this puzzle have content. Aim for at least
			75%.
		</p>
	{:else if modalContentType === PUBLISH_PUZZLE}
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
	<button
		type="button"
		on:click={saveGridAndCreateHints}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Continue anyway!</button
	>
</Modal>
