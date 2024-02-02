<script lang="ts">
	// components/crossword/EditPuzzleTitle.svelte
	import { enhance } from '$app/forms';
	import Button from '$components/Button.svelte';
	import type { ActionData } from '../../routes/puzzles/[id]/editGrid/$types';

	type Form = {
		error?: any;
		success?: boolean;
		message?: string;
	};

	type Message = {
		text?: string;
		type?: 'error' | 'success';
	} | null;

	let form: Form;
	export let title: string;
	export let id: string;

	$: message = getMessage(form);

	function getMessage(form: Form): Message {
		console.log(form);
		if (form) {
			if (!form?.success) {
				return {
					text: form.message,
					type: 'error'
				};
			} else if (form?.success) {
				return {
					text: form.message,
					type: 'success'
				};
			}
		}
		return null;
	}
</script>

{#if message?.type === 'error'}
	<p class="text-red-500 mb-4">{message?.text}</p>
{:else if message?.type === 'success'}
	<p class="text-green-500 mb-4">{message?.text}</p>
{/if}
<div class="flex">
	<div class="mr-auto">
		<form method="POST" action="?/updateTitle" use:enhance>
			<input type="hidden" name="originalTitle" value={title} />
			<input type="hidden" name="id" value={id} />
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
	</div>
	<form method="POST" action="?/delete" use:enhance>
		<input type="hidden" name="id" value={id} />
		Danger Zone!
		<Button buttonType="submit" style="primary">Delete</Button>
	</form>
</div>
