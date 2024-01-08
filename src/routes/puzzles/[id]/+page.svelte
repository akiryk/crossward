<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzle } = data);
</script>

<div class="guide">
	{#if puzzle.title}
		<h2>{puzzle.title}</h2>
	{:else}
		<h2>Untitled Puzzle</h2>
	{/if}
	<p>This is a puzzle.</p>
</div>
