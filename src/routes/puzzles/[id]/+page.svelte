<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Crossword from '$lib/crossword/Crossword.svelte';
	import Button from '$components/Button.svelte';

	export let data: PageData;
	export let form;
	// destructure puzzles from data
	$: ({ puzzle, isEditing, isCreateSuccess } = data);
</script>

<div>
	{#if puzzle}
		<h2>{form?.title || puzzle.title}</h2>

		{#if puzzle.grid}
			<Crossword grid={puzzle.grid} {isEditing} />
		{/if}

		{#if form?.error}
			<p class="error">{form.error}</p>
		{/if}

		{#if form?.success}
			<p>You did it successfully.</p>
		{/if}

		{#if isCreateSuccess}
			<p>Successfully created a new {puzzle.puzzleType} puzzle!</p>
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
				<Button buttonType="submit" style="primary">Update</Button>
			</form>

			<hr class="my-10" />
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={puzzle._id} />
				<Button buttonType="submit" style="alert">Delete</Button>
			</form>
		{/if}
	{:else}
		<h2>Gee, something went wrong.</h2>
		<p>
			Wwe can't seem to find the puzzle you requested. You might want to return to the <a
				class="text-sky-600"
				href="/puzzles">puzzles page</a
			> and try another.
		</p>
	{/if}
</div>
