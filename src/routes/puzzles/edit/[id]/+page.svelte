<script lang="ts">
	import WrongPage from '$lib/WrongPage.svelte';
	import type { PageData } from './$types';
	export let data: PageData;

	// destructure puzzles from data
	$: ({ puzzle } = data);
</script>

<div class="guide">
	{#if puzzle.title}
		<h2>Update {puzzle.title}</h2>
		<form method="POST" class="bg-white px-8 pt-6 pb-8 mb-4">
			<div class="mb-4">
				<label class="block text-gray-700 text-sm font-bold mb-2" for="username"> Title </label>
				<input
					class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					id="title"
					type="text"
					placeholder={puzzle.title}
				/>
			</div>
			<div class="flex items-center justify-between">
				<button
					class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					type="submit"
				>
					Update Puzzle
				</button>
			</div>
		</form>
	{:else}
		<WrongPage href="/puzzles" />
	{/if}
</div>
