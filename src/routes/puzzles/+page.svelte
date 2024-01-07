<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzles, session } = data);
	console.log('puzzles', puzzles);
</script>

<section>
	<h1>puzzles</h1>
	{#if session?.user}
		<ul>
			hi
			{#each puzzles as puzzle}
				<li>{puzzle.title}</li>
			{/each}
		</ul>
	{:else}
		<p>Look buddy,you need to log in before you access this special section</p>
		<p>Hint: go <a href="/">home</a> and try again</p>
	{/if}
</section>
