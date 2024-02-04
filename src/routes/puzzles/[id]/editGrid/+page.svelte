<script lang="ts">
	// [id]/editGrid/page.svelte
	import { type ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { LoadData } from './+page.server.ts';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import GameStore from '../../../../stores/GameStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import { UserMode, BannerType, type EditorPuzzle, type CellMapArray } from '$utils/types';
	import Banner from '$components/Banner.svelte';
	import { promiseDebounce, chunkArray } from '$utils/helpers';
	import type { ActionData } from './$types.js';

	export let puzzle: EditorPuzzle;
	export let data: LoadData;
	export let isCreateSuccess: boolean;

	export let form: ActionData;

	let isSaveForShowHints = false;
	let errorMessage: string = '';
	let successMessage: string = '';
	let isPreview = false;

	$: ({ puzzle, isCreateSuccess } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
			const activeCellIds: Array<ID> = [];
			const cellMap = puzzle.cellMap;
			Object.values(cellMap).forEach((cell) => {
				if (cell.correctValue || cell.isSymmetrical) {
					activeCellIds.push(cell.id);
				}
			});
			console.log(activeCellIds);

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

	const handleOnPreview = () => {
		isPreview = true;
	};

	const handleOffPreview = () => {
		isPreview = false;
	};

	async function saveData(data: FormData) {
		// don't try to save if we redirect to hints page because data is already saved
		// and the context will switch and we'll get errors when trying to hit nonexistent endpoint
		if (isSaveForShowHints) {
			return;
		}
		const formCellMap = data?.get('cellMap');
		const id = data?.get('id');
		if (typeof formCellMap !== 'string' || typeof id !== 'string') {
			return;
		}
		const cellsArray: CellMapArray = Object.entries(JSON.parse(formCellMap));
		const chunkedData = chunkArray(cellsArray, 25);

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
				if (result.type === 'success' && !isSaveForShowHints) {
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
		// @ts-ignore
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
				// rerun all `load` functions, following the successful update
				// await invalidateAll();
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
		promiseDebounceSave(formData);
	};

	const handleFinishGrid = async () => {
		await handleSaveCellMap();
		isSaveForShowHints = true;
		createHints();
	};
</script>

<div class="p-4">
	<div>
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
				on:submit|preventDefault={handleSaveCellMap}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(puzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword
						{puzzle}
						userMode={isPreview ? UserMode.PREVIEW : UserMode.EDITING_CELLS}
						onInput={handleSaveCellMap}
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
					<button
						class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
						>Update save</button
					>
					<button
						type="button"
						on:click={handleFinishGrid}
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
	</div>
	<EditPuzzleTitle {form} title={puzzle.title} id={puzzle._id} />
</div>
