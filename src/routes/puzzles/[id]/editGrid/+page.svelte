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
	import { DEFAULT_CHUNK_SIZE } from '$utils/constants';
	import type { ActionData } from './$types.js';
	import {
		findWordsThatAreTooShort,
		getActiveCellIdsFromCellMap,
		findIfPuzzleFailsRotationalSymmetry
	} from './editGridHelpers.js';

	export let puzzle: EditorPuzzle;
	export let data: LoadData;
	export let isCreateSuccess: boolean;

	export let form: ActionData;

	let preventSaveOnTransitionToHintsPage = false;
	let errorMessage: string = '';
	let lastSavedAtMessage: string = '';
	let isPreview = false;
	let showModal = false;
	let modalContentType = '';
	let percentOfCompleteCells: string;

	const MISSING_SYMMETRY = 'MISSING_SYMMETRY';
	const TWO_LETTER_WORDS = 'TWO_LETTER_WORDS';
	const PUZZLE_INCOMPLETE = 'PUZZLE_INCOMPLETE';

	$: ({ puzzle, isCreateSuccess } = data);

	$: onMount(() => {
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
					lastSavedAtMessage = result.data?.message;
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

		promiseDebounceSave(formData);
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

		// 1. Check for a mostly incomplete puzzle in which less than 50% of the cells have values
		const percentComplete = activeCellIds.length / Object.keys(puzzle.cellMap).length;
		if (percentComplete < 0.5) {
			percentOfCompleteCells = (percentComplete * 100).toFixed();
			modalContentType = PUZZLE_INCOMPLETE;
			showModal = true;
			return;
		}

		// 2 Check rotational symmetry
		if (findIfPuzzleFailsRotationalSymmetry(puzzle.cellMap)) {
			modalContentType = MISSING_SYMMETRY;
			showModal = true;
			return;
		}

		// 3. Check for two-letter words
		const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
		GameStore.update((current: GameContext) => {
			return {
				...current,
				twoLetterWordIds
			};
		});
		if (twoLetterWordIds.length > 0) {
			modalContentType = TWO_LETTER_WORDS;
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
		<div class="mb-5 w-fit flex" use:clickOutside={{ callback: handleClickOutside }}>
			<Crossword {puzzle} {isPreview} userMode={UserMode.EDITING_CELLS} onInput={handleInput} />
		</div>
		<!-- ERROR MESSAGES -->
		{#if errorMessage}
			<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
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
	{/if}
	<button
		type="button"
		on:click={saveGridAndCreateHints}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Continue anyway!</button
	>
</Modal>
