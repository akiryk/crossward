<script lang="ts">
	// components/crossword/EditPuzzleTitle.svelte
	import { enhance } from '$app/forms';
	import Button from '$components/Button.svelte';

	export let error: unknown = '';
	export let title: string;
	export let id: string;
	export let success: unknown;
</script>

<div class="flex">
	<div class="mr-auto">
		<form method="POST" action="?/updateTitle" use:enhance>
			<input type="hidden" name="originalTitle" value={title} />
			<label>
				Edit the title:
				<input
					type="text"
					name="title"
					class="border-solid border-2 border-indigo-600 p-2"
				/></label
			>
			<Button buttonType="submit" style="primary">Update</Button>
		</form>
		{#if !!error}
			<p class="error">{error}</p>
		{/if}

		{#if !!success}
			<p>Success!</p>
			<p>Name is now {title}</p>
		{/if}
	</div>
	<form method="POST" action="?/delete" use:enhance>
		<input type="hidden" name="id" value={id} />
		Danger Zone!
		<Button buttonType="submit" style="primary">Delete</Button>
	</form>
</div>
