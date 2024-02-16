<!-- PLAY PAGE -->
<script lang="ts">
	import { type ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import type { LoadData } from './+page.server.ts';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import GameStore from '../../../../stores/GameStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import Hints from '$lib/crossword/PlayHints.svelte';
	import type { PlayerPuzzle, ID, CellIdTuple } from '$utils/types';
	import { UserMode } from '$utils/types';
	import { debounce, chunkArray } from '$utils/helpers';
	import {
		COMPLETE_BUT_WITH_ERRORS,
		COMPLETE_AND_NO_ERRORS,
		INCOMPLETE,
		DEFAULT_CHUNK_SIZE
	} from '$utils/constants';
	import { clickOutside } from '$utils/useClickOutside';

	type CompletionData = {
		isComplete: boolean;
		incorrectCells: ID[];
	};

	export let puzzle: PlayerPuzzle;
	export let data: LoadData;

	let isComplete = false;
	const incorrectCells: Array<ID> = [];

	const cellIdsInSaveQueueSet: Set<ID> = new Set();

	$: ({ puzzle } = data);

	onMount(() => {
		if (puzzle) {
			PuzzleStore.set(puzzle);
			const { isComplete, incorrectCells } = getCompletionStatus(puzzle);
			setPuzzlePlayMode({ isComplete, incorrectCells });
		}
	});

	const unsubscribe = PuzzleStore.subscribe((data) => {
		if (data && 'incorrectCells' in data && 'playMode' in data) {
			puzzle = data;
		}
	});

	onDestroy(() => {
		unsubscribe();
	});

	function handleClickOutside() {
		GameStore.update((current) => ({
			...current,
			highlightedCellIds: []
		}));
	}

	function getCompletionStatus(puzzle: PlayerPuzzle): CompletionData {
		isComplete = true;
		Object.values(puzzle.cellMap).forEach((cell) => {
			const id: ID = `${cell.x}:${cell.y}`;
			if (!cell.value && cell.correctValue) {
				isComplete = false;
			}
			const isFalseAnswer = cell.correctValue && cell.value !== cell.correctValue;
			const index = incorrectCells.indexOf(id);

			if (isFalseAnswer && index === -1) {
				incorrectCells.push(id);
			} else if (!isFalseAnswer && index >= 0) {
				// mutate the array so the entire page knows when all cells are complete
				incorrectCells.splice(index, 1);
			}
		});
		return {
			isComplete,
			incorrectCells
		};
	}

	async function updatePuzzleAsComplete() {
		try {
			const formData = new FormData();
			formData.append('id', puzzle!._id);
			const response = await fetch('?/gameOver', {
				method: 'POST'
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'error') {
				throw new Error('Request failed');
			}
		} catch (error) {
			console.error('Error saving');
		}
	}

	async function saveData() {
		if (puzzle === null) {
			return;
		}

		if (cellIdsInSaveQueueSet.size === 0) {
			return;
		}

		// Save endpoint expects data as array of tupples, so make it here.
		// It should be fast since the array will only have 3 or 4 items max.
		const cellsToUpdate: Array<CellIdTuple> = [];
		cellIdsInSaveQueueSet.forEach((id: ID) => {
			cellsToUpdate.push([id, puzzle!.cellMap[id]]);
		});
		cellIdsInSaveQueueSet.clear();
		const chunkedData = chunkArray(cellsToUpdate, DEFAULT_CHUNK_SIZE);

		chunkedData.forEach(async (chunk) => {
			const formData = new FormData();
			formData.append('chunk', JSON.stringify(chunk));
			formData.append('id', puzzle!._id);
			try {
				const response = await fetch('?/saveGame', {
					method: 'POST',
					body: formData
				});

				const result: ActionResult = deserialize(await response.text());
				if (result.type === 'error') {
					throw new Error('Request failed');
				}
			} catch (error) {
				console.error('Error saving chunk:');
			}
		});
	}

	const debounceSaveUpdatedCellMap = debounce(saveData, 300);

	const handleSaveOnInput = (id: ID) => {
		cellIdsInSaveQueueSet.add(id);
		debounceSaveUpdatedCellMap();

		if (puzzle) {
			const { isComplete, incorrectCells } = getCompletionStatus(puzzle);
			setPuzzlePlayMode({ isComplete, incorrectCells });
		}
	};

	function setPuzzlePlayMode({ isComplete, incorrectCells }: CompletionData) {
		puzzle.incorrectCells = incorrectCells;
		if (incorrectCells.length && isComplete) {
			puzzle.playMode = COMPLETE_BUT_WITH_ERRORS;
		} else if (incorrectCells.length === 0 && isComplete) {
			puzzle.playMode = COMPLETE_AND_NO_ERRORS;
			updatePuzzleAsComplete();
		} else {
			puzzle.playMode = INCOMPLETE;
		}
		PuzzleStore.set(puzzle);
	}

	const handleSubmit = async () => {
		debounceSaveUpdatedCellMap();
	};
</script>

{#if (puzzle.playMode = COMPLETE_AND_NO_ERRORS)}
	<h1 class="mb-3 font-bold">GAME OVER!!!</h1>
{:else}
	<h1 class="mb-3 font-bold">Play {puzzle.title}</h1>
{/if}
<div class="flex">
	<div class="mb-5 w-fit mr-8" use:clickOutside={{ callback: handleClickOutside }}>
		<form
			method="POST"
			action="?/saveGame"
			autocomplete="off"
			on:submit|preventDefault={handleSubmit}
		>
			<input type="hidden" name="cellMap" value={JSON.stringify(puzzle?.cellMap)} />
			<input type="hidden" name="id" value={puzzle._id} />
			<Crossword
				userMode={isComplete && incorrectCells.length === 0 ? UserMode.GAME_OVER : UserMode.PLAY}
				onInput={handleSaveOnInput}
			/>
		</form>
	</div>
	<Hints {puzzle} />
</div>
