<script lang="ts">
	// [id]/editGrid/page.svelte
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import EditPuzzleTitle from '$lib/crossword/EditPuzzleTitle.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import { GameStatus, BannerType, type Puzzle, type DynamicCell } from '$utils/types';
	import Button from '$components/Button.svelte';
	import Banner from '$components/Banner.svelte';
	import { debounce, promiseDebounce, chunkArray } from '$utils/helpers';
	import { goto } from '$app/navigation';

	export let dynamicPuzzle: Puzzle | null;
	export let data;
	export let form;

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

	async function saveData() {
		if (dynamicPuzzle === null) {
			return;
		}
		const cellsArray: Array<Array<string | DynamicCell>> = Object.entries(dynamicPuzzle.cellMap);
		const chunkedData = chunkArray(cellsArray, 5);

		chunkedData.forEach(async (chunk) => {
			// chunk = [["0:0", cell1], ["0:1", cell2], etc ... ]
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			// @ts-expect-error ts complains that dynamicPuzzle may be null but it cannot be null
			// because we return at the top of saveData if it is
			formData.append('id', dynamicPuzzle._id);
			try {
				const response = await fetch(`?/updateCellMap`, {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					throw new Error('Request failed');
				}
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

	const promiseDebounceSave = promiseDebounce(saveData, 300);

	const handleSaveOnInput = async () => {
		promiseDebounceSave();
	};

	const handleFinishGrid = async () => {
		await handleSaveOnInput();
		createHints();
	};

	$: ({ puzzle, isCreateSuccess } = data);
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
			<form autocomplete="off" on:submit={(event) => event.preventDefault()}>
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
		<p>huh.</p>
	{/if}
</div>
