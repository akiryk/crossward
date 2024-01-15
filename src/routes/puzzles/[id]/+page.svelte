<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import Button from '$components/Button.svelte';

	export let data: PageData;
	export let form;
	console.log(data);
	// destructure puzzles from data
	$: ({ puzzle, isEditing } = data);
</script>

<div>
	{#if puzzle.title}
		<h2>{form?.title || puzzle.title}</h2>

		{#if !form}
			<h2>Play the game</h2>
			{#if puzzle.puzzle}
				<Crossword grid={puzzle.puzzle} />
			{/if}
		{/if}

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		{#if form?.success}
			<p>You did it successfully.</p>
		{/if}

		{#if isEditing}
			<form method="POST" action="?/update" use:enhance>
				<input type="hidden" name="originalTitle" value={puzzle.title} />
				<label>
					Title:
					<input
						type="text"
						placeholder={puzzle.title}
						name="title"
						value={form?.title ?? ''}
						class="border-solid border-2 border-indigo-600 p-2"
					/></label
				>
			</form>

			<hr class="mb-10" />
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={puzzle._id} />
				<Button buttonType="submit" style="alert">Delete</Button>
			</form>
		{/if}
	{:else}
		<h2>Hmmm, you seem lost.</h2>
		<p>
			Are you lost? You might want to return to the <a class="text-sky-600" href="/puzzles"
				>puzzles page</a
			> and try again.
		</p>
	{/if}
</div>
