<script lang="ts">
	import type { PageData } from './$types';
	import type { Puzzles } from '$utils/types';

	import { enhance } from '$app/forms';

	import List from '$components/List.svelte';
	import ListItem from '$components/ListItem.svelte';
	import Button from '$components/Button.svelte';

	export let puzzles: Puzzles;
	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzles } = data);
</script>

<section>
	<h1 class="mb-2 mt-0 text-2xl font-medium leading-tight text-primary">Puzzles</h1>
	<div class=" bg-slate-100 px-2 pt-2 pb-8 border-solid border border-gray-200 sm:max-w-lg bg-gray">
		<h2 class="my-2 text-md font-medium">Create a puzzle</h2>
		<form method="POST" action="?/create" use:enhance>
			<div>
				<label>
					Title:
					<input
						type="text"
						placeholder="A New Puzzle Title!"
						name="title"
						class="border-solid border border-gray-400 p-2"
					/></label
				>
			</div>
			<div>
				<label>
					How many cells across?
					<input
						type="number"
						name="crossSpan"
						value="5"
						class="border-solid border border-gray-400 p-2"
					/></label
				>
			</div>
			<div>
				<label>
					How many cells down?
					<input
						type="number"
						name="downSpan"
						value="5"
						class="border-solid border border-gray-400 p-2"
					/></label
				>
			</div>
			<Button type="primary">Start Building!</Button>
		</form>
	</div>
	<List type="ul">
		{#each puzzles as puzzle}
			<ListItem>
				<span
					><a href="/puzzles/{puzzle._id}" class="text-sky-600">{puzzle.title}</a>
					<span><a href="/puzzles/{puzzle._id}?edit=true" class="text-gray-400">edit</a></span>
				</span>
			</ListItem>
		{/each}
	</List>
</section>
