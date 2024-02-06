<script lang="ts">
	import { type PlayerPuzzle } from '$utils/types';
	export let puzzle: PlayerPuzzle;
</script>

{#if puzzle.acrossHints || puzzle.downHints}
	<div class="flex">
		<div class="mr-2 w-full">
			<h2 class="font-bold text-left">Across Hints</h2>
			{#each puzzle.acrossHints as hint}
				<p>
					<span>{hint.displayNumber}.</span>
					{hint.hint}
				</p>
			{/each}
		</div>
		<div class="ml-2 w-full">
			<h2 class="font-bold text-left">Down Hints</h2>
			{#each puzzle.downHints as hint}
				<p>
					<span>{hint.displayNumber}.</span>
					{hint.hint}
				</p>
			{/each}
		</div>
	</div>
{/if}
