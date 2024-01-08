<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzle } = data);
</script>

<div class="guide">
	{#if puzzle.title}
		<h2>{puzzle.title}</h2>
		<p>Now, this is a puzzle!</p>
	{:else}
		<h2>Hmmm, you seem lost.</h2>
		<p>
			Are you lost? You might want to return to the <a class="text-sky-600" href="/puzzles"
				>puzzles page</a
			> and try again.
		</p>
	{/if}
</div>
