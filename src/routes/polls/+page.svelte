<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Puzzle } from '$utils/types';
	import PuzzleStore from '../../stores/PuzzleStore';

	export let storeData: Puzzle | null;

	export let data;
	// destructure puzzles from data
	$: ({ puzzle } = data);

	const unsubscribe = PuzzleStore.subscribe((data) => {
		storeData = data;
	});

	onMount(() => {
		PuzzleStore.set(puzzle);
		console.log('storeData', storeData);
	});

	onDestroy(() => {
		unsubscribe();
	});

	let puzzleData: Puzzle | null = puzzle;

	$: puzzleData = storeData;

	export let handleChange1 = (e) => {
		console.log(e.target.value);

		storeData.grid.cellMap['0:0'].correctValue = e.target.value;
		storeData.set({ ...storeData });
	};

	export let handleChange2 = (e) => {
		storeData.grid.cellMap['0:1'].correctValue = e.target.value;
		storeData.set({ ...storeData });
	};

	$: puzzleData;
</script>

<div>
	{#if puzzleData}
		<h1 class="text-lg font-bold">{puzzleData.title}</h1>
		<p>The value is: {puzzleData.grid.cellMap['0:0'].correctValue}</p>
		<p class="mb-4">The value is: {puzzleData.grid.cellMap['0:1'].correctValue}</p>

		<div class="mb-4">
			<h1 class=" font-medium">Cell 0:0</h1>
			<div class="mb-4">
				<input
					class="border border-solid border-gray-300 mb-4"
					type="text"
					on:input={handleChange1}
				/>
			</div>
		</div>
		<div class="mb-4">
			<h1 class=" font-medium">Cell 0:1</h1>
			<div class="mb-4">
				<input
					class="border border-solid border-gray-300 mb-4"
					type="text"
					on:input={handleChange2}
				/>
			</div>
		</div>
	{/if}
</div>
