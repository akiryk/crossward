<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import PuzzleStore from '../../../../stores/PuzzleStore';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import ErrorMessage from '$lib/crossword/ErrorMessage.svelte';
	import PuzzleHeading from '$lib/crossword/PuzzleHeading.svelte';
	import type { Puzzle } from '$utils/types';
	import { GameStatus } from '$utils/types';

	export let dynamicPuzzle: Puzzle | null;

	export let data;

	$: ({ puzzle, isCreateSuccess } = data);

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
</script>

<div>
	{#if puzzle}
		<PuzzleHeading
			puzzleType={puzzle.puzzleType}
			gameStatus={GameStatus.PLAY}
			title={puzzle.title}
		/>

		{#if dynamicPuzzle || puzzle}
			<div class="mb-5">
				<Crossword puzzle={dynamicPuzzle || puzzle} gameStatus={GameStatus.EDIT_HINTS} />
			</div>
		{/if}
	{:else}
		<ErrorMessage />
	{/if}
</div>