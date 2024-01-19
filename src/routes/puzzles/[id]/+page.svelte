<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import type { DynamicGrid } from '$utils/types';
	import PuzzleStore from '../../../stores/PuzzleStore';

	export let storeGrid: DynamicGrid | null;

	export let data;

	$: ({ grid: ssrGrid } = data);

	const unsubscribe = PuzzleStore.subscribe((data) => {
		if (data) {
			storeGrid = data;
		}
	});

	onMount(() => {
		PuzzleStore.set(ssrGrid);
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div>
	<Crossword grid={storeGrid || ssrGrid} isEditing={true} />

	<p>
		The value is: {storeGrid?.cellMap['0:0'].value || ssrGrid.cellMap['0:0'].value}
	</p>
	<p class="mb-4">
		The value is: {storeGrid?.cellMap['0:1'].value || ssrGrid.cellMap['0:1'].value}
	</p>
</div>
