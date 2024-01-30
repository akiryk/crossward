<script lang="ts">
	// [id]/editGrid/page.svelte
	import { type ActionResult } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';
	import { invalidateAll, goto } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import { GameStatus, BannerType, type Puzzle, type DynamicCell } from '$utils/types';
	import Button from '$components/Button.svelte';
	import Banner from '$components/Banner.svelte';
	import { debounce, promiseDebounce, chunkArray } from '$utils/helpers';

	export let dynamicPuzzle: Puzzle | null;
	export let data;
	export let form;
	let formElement: HTMLFormElement;
	$: formDataObject = formElement;

	let errorMessage: string = '';
	let successMessage: string = '';
	let isPreview = false;

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

	const handleOnPreview = () => {
		isPreview = true;
	};

	const handleOffPreview = () => {
		isPreview = false;
	};

	async function saveData(data: FormData) {
		const formCellMap = data?.get('cellMap');
		const id = data?.get('id');
		if (typeof formCellMap !== 'string' || typeof id !== 'string') {
			return;
		}
		const cellsArray: Array<Array<string | DynamicCell>> = Object.entries(JSON.parse(formCellMap));
		const chunkedData = chunkArray(cellsArray, 5);

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
				// applyAction(result);
			} catch (error) {
				console.error('Error saving chunk:', error);
			}
		});
	}

	async function createHints() {
		if (dynamicPuzzle === null) {
			return;
		}
		const formData = new FormData();
		const id = dynamicPuzzle._id;
		formData.append('id', id);
		try {
			const response = await fetch(`?/createHints`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Request failed');
			}

			goto(`/puzzles/${id}/editHints`);
		} catch (error) {
			console.error('Error saving hints:', error);
		}
	}

	const promiseDebounceSave = promiseDebounce(saveData);

	const handleSaveOnInput = async () => {
		if (!dynamicPuzzle) {
			return;
		}
		const formData = new FormData();
		formData.append('cellMap', JSON.stringify(dynamicPuzzle.cellMap));
		formData.append('id', dynamicPuzzle._id);
		promiseDebounceSave(formData);
	};

	const handleFinishGrid = async () => {
		await handleSaveOnInput();
		createHints();
	};

	const handleSubmit = async (event: Event) => {
		const data = new FormData(event.currentTarget as HTMLFormElement);
		promiseDebounceSave(data);
	};

	$: ({ puzzle, isCreateSuccess } = data);
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
				method="POST"
				action="?/updateCellMap"
				autocomplete="off"
				on:submit|preventDefault={handleSubmit}
				bind:this={formElement}
			>
				<input type="hidden" name="cellMap" value={JSON.stringify(dynamicPuzzle?.cellMap)} />
				<input type="hidden" name="id" value={puzzle._id} />
				<div class="mb-5">
					<Crossword
						puzzle={dynamicPuzzle || puzzle}
						gameStatus={isPreview ? GameStatus.PREVIEW : GameStatus.EDITING_CELLS}
						onInput={handleSaveOnInput}
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

		<EditPuzzleTitle success={form?.success} title={form?.title || puzzle.title} id={puzzle._id} />
	{:else}
		<p>Something went wrong and we can't load the puzzle.</p>
	{/if}
</div>
