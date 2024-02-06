<script lang="ts">
	import { type PlayerPuzzle } from '$utils/types';
	import PlayHintRow from './PlayHintRow.svelte';
	export let puzzle: PlayerPuzzle;
</script>

{#if puzzle.acrossHints || puzzle.downHints}
	<div class="flex">
		<div class="mr-2 w-full">
			<h2 class="font-bold text-left">Across Hints</h2>
			{#each puzzle.acrossHints as hint}
				<PlayHintRow hint={hint.hint} displayNumber={hint.displayNumber} />
			{/each}
		</div>
		<div class="ml-2 w-full">
			<h2 class="font-bold text-left">Down Hints</h2>
			{#each puzzle.downHints as hint}
				<PlayHintRow hint={hint.hint} displayNumber={hint.displayNumber} />
			{/each}
		</div>
	</div>
{/if}
