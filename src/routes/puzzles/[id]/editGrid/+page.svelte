<script lang="ts">
	// [id]/editGrid/page.svelte
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
		type GameContext
	} from '$utils/types';
	import Banner from '$components/Banner.svelte';
	import Modal from '$components/Modal.svelte';
	import { promiseDebounce, chunkArray } from '$utils/helpers';
	import { DEBOUNCE_DEFAULT_DELAY, DEFAULT_CHUNK_SIZE } from '$utils/constants';
	import type { ActionData } from './$types.js';
	import { findWordsThatAreTooShort, getActiveCellIdsFromCellMap } from './editGridHelpers.js';

	export let puzzle: EditorPuzzle;
	export let data: LoadData;
	export let isCreateSuccess: boolean;

	export let form: ActionData;

	let preventSaveOnTransitionToHintsPage = false;
	let errorMessage: string = '';
	let successMessage: string = '';
	let isPreview = false;
	let showModal = false;
	let modalTitle = '';
	let modalMessage = '';

	$: ({ puzzle, isCreateSuccess } = data);

	onMount(() => {
		if (puzzle) {
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

	function handleClickOutside() {
		GameStore.update((current) => ({
			...current,
			highlightedCellIds: []
		}));
	}

	const handleTogglePreview = (event: Event) => {
		if ((event.target as HTMLInputElement).checked) {
			setTimeout(() => {
				const { activeCellIds } = get(GameStore);
				const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
				GameStore.update((current: GameContext) => {
					return {
						...current,
						twoLetterWordIds
					};
				});
			}, 0);
			isPreview = true;
		} else {
			isPreview = false;
		}
	};

	async function saveData(data: FormData) {
		// don't try to save if we redirect to hints page!
		// - the data is already saved (it happens just before we call createHints())
		// - if we do try to save, we'll get errors after the page changes and we try to hit a nonexistent endpoint
		if (preventSaveOnTransitionToHintsPage) {
			return;
		}
		const formCellMap = data?.get('cellMap');
		const id = data?.get('id');
		if (typeof formCellMap !== 'string' || typeof id !== 'string') {
			return;
		}
		const cellsArray: CellMapArray = Object.entries(JSON.parse(formCellMap));
		const chunkedData = chunkArray(cellsArray, DEFAULT_CHUNK_SIZE);

		chunkedData.forEach(async (chunk) => {
			// chunk = [["0:0", cell1], ["0:1", cell2], etc ... ]
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			formData.append('id', id);
			try {
				const response = await fetch(`?/updateCellMap`, {
					method: 'POST',
					body: formData
				});
				const result: ActionResult = deserialize(await response.text());
				if (result.type === 'success') {
					successMessage = result.data?.message;
					// rerun all `load` functions, following the successful update
					// await invalidateAll();
				} else if (result.type === 'failure') {
					errorMessage = result.data?.message;
				}
			} catch (error) {
				console.error('Error saving chunk:', error);
			}
		});
	}

	async function createHints() {
		if (puzzle === null) {
			return;
		}
		const formData = new FormData();
		const id = puzzle._id;
		formData.append('id', id);
		try {
			const response = await fetch(`?/createHints`, {
				method: 'POST',
				body: formData
			});

			const result: ActionResult = deserialize(await response.text());

			if (result.type === 'success') {
				goto(`/puzzles/${id}/editHints`);
			} else if (result.type === 'failure') {
				errorMessage = result.data?.message;
			}
		} catch (error) {
			console.error('Error saving hints:', error);
		}
	}

	const promiseDebounceSave = promiseDebounce(saveData);

	const handleSaveCellMap = async (debounceDelay: number = DEBOUNCE_DEFAULT_DELAY) => {
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

		promiseDebounceSave(formData, debounceDelay);
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
	};

	const validateGridIsReadyForHints = async () => {
		const { activeCellIds } = get(GameStore);
		const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
		GameStore.update((current: GameContext) => {
			return {
				...current,
				twoLetterWordIds
			};
		});
		if (twoLetterWordIds.length > 0) {
			modalTitle = 'Hold on, there!';
			modalMessage = `This puzzle has ${
				twoLetterWordIds.length === 2
					? 'a two-letter word'
					: twoLetterWordIds.length / 2 + ' two-letter words'
			}. Are you sure you want to proceed?`;
			showModal = true;
			return;
		}
		if (activeCellIds.length < 3) {
			modalTitle = 'Hold on, there!';
			modalMessage = `This puzzle doesn't have much content. Are you sure you want to proceed?`;
			showModal = true;
			return;
		}

		saveGridAndCreateHints();
	};

	async function saveGridAndCreateHints() {
		await handleSaveCellMap();
		preventSaveOnTransitionToHintsPage = true;
		createHints();
	}
</script>

<PuzzleHeading
	isCreateSuccess={isCreateSuccess ? true : false}
	puzzleType={puzzle.puzzleType}
	userMode={UserMode.EDITING_CELLS}
	title={puzzle.title}
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
		<div class="mb-5" use:clickOutside={{ callback: handleClickOutside }}>
			<Crossword {puzzle} {isPreview} userMode={UserMode.EDITING_CELLS} onInput={handleInput} />
		</div>
		<!-- ERROR MESSAGES -->
		{#if errorMessage}
			<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
		{/if}

		<!-- SUCCESS MESSAGES -->
		{#if successMessage}
			<Banner message={successMessage} bannerType={BannerType.IS_SUCCESS} />
		{/if}

		<div class="mb-5 flex items-center">
			<button
				class="text-gray-900 mr-10 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
				>Update save</button
			>
			<button
				type="button"
				on:click={validateGridIsReadyForHints}
				class="text-gray-900 mr-10 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
				>Make Hints</button
			>

			<label for="togglePreview">
				<input id="togglePreview" type="checkbox" on:change={handleTogglePreview} />
				Toggle Preview Mode
			</label>
		</div>
	</form>
{/if}

<hr class="my-10" />
<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />

<Modal bind:showModal>
	<h2 slot="header">
		{modalTitle}
	</h2>

	<p class="mb-10">{modalMessage}</p>
	<button class="btn" on:click={saveGridAndCreateHints}>Yes I do!</button>
</Modal>
