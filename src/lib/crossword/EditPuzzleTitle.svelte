<script lang="ts">
	// components/crossword/EditPuzzleTitle.svelte
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Button from '$components/Button.svelte';
	import Modal from '$components/Modal.svelte';
	import { UPDATE_TITLE, DELETE_PUZZLE } from '$utils/constants';
	import type { ActionData } from '../../routes/puzzles/[id]/create/$types';

	type Message = {
		text?: string;
		type?: 'error' | 'success';
		action?: string;
	} | null;

	export let form: ActionData;
	export let title: string;
	export let id: string;

	let showModal = false;

	$: message = getMessage(form);

	async function handleDelete() {
		const formData = new FormData();
		formData.append('id', id);
		try {
			await fetch(`?/delete`, {
				method: 'POST',
				body: formData
			});
			goto('/?isDeleteSuccess=true');
		} catch (error) {
			console.error('Error deleting puzzle');
		}
	}

	function getMessage(form: ActionData): Message {
		if (form) {
			if (!form?.success) {
				return {
					text: form.message,
					type: 'error',
					action: form.action
				};
			} else if (form?.success) {
				return {
					text: form.message,
					type: 'success',
					action: form.action
				};
			}
		}
		return null;
	}
</script>

{#if message?.action === UPDATE_TITLE}
	{#if message?.type === 'error'}
		<p class="text-red-500 mb-4">{message?.text}</p>
	{:else if message?.type === 'success'}
		<p class="text-green-500 mb-4">{message?.text}</p>
	{/if}
{/if}
<div class="flex">
	<div class="mr-auto">
		<form method="POST" action="?/updateTitle" use:enhance>
			<input type="hidden" name="originalTitle" value={title} />
			<input type="hidden" name="id" value={id} />
			<label>
				Edit the title:
				<input
					placeholder={title}
					type="text"
					name="title"
					class="ml-2 border-solid border-1 border-gray-300 p-2"
				/></label
			>
			<Button buttonType="submit" style="primary">Update</Button>
		</form>
	</div>
	<form
		method="POST"
		action="?/delete"
		on:submit|preventDefault={() => {
			showModal = true;
		}}
	>
		<input type="hidden" name="id" value={id} />
		<span class="mr-2">Danger Zone!</span>
		<Button buttonType="submit" style="primary">Delete</Button>
	</form>
</div>
{#if message?.action === DELETE_PUZZLE}
	{#if message?.type === 'error'}
		<p class="text-red-500 mb-4">{message?.text}</p>
	{:else if message?.type === 'success'}
		<p class="text-green-500 mb-4">{message?.text}</p>
	{/if}
{/if}

<Modal bind:showModal>
	<h2 slot="header">Hoo, boy! You gonna Delete?</h2>

	<p class="mb-10">You sher 'bout that?'</p>
	<button class="btn mb-4" on:click={handleDelete}>Yes, Delete!</button>
</Modal>
