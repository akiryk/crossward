<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzles } = data);
</script>

<section>
	<h1 class="mb-2 mt-0 text-2xl font-medium leading-tight text-primary">Puzzles</h1>

	<ul class="w-96">
		{#each puzzles as puzzle}
			<li
				class="w-full border-b-2 border-neutral-100 border-opacity-100 py-4 dark:border-opacity-50"
			>
				<span
					><a href="/puzzles/{puzzle._id}" class="text-sky-600">{puzzle.title}</a>
					<span><a href="/puzzles/{puzzle._id}?edit=true" class="text-gray-400">edit</a></span>
				</span>
			</li>
		{/each}
	</ul>
</section>
