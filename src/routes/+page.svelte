<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import Modal from '$components/Modal.svelte';
	import type { PageData, ActionData } from './$types';
	import type { Puzzles } from '$utils/types';
	import { EDIT_PUZZLE, PUBLISHED, MINI, DAILY, SUNDAY, EDITING_HINTS } from '$utils/constants';

	import List from '$components/List.svelte';
	import ListItem from '$components/ListItem.svelte';

	export let puzzles: Puzzles | undefined;
	export let data: PageData;
	export let form: ActionData & {
		error?: boolean;
		message?: string;
	};

	let showModal = false;

	$: ({ puzzles } = data);
	$: isCreateSuccess = $page.url.searchParams.get('create');
	$: newPuzzleId = $page.url.searchParams.get('newPuzzleId');

	function autofocus(element: HTMLInputElement) {
		console.log();
		tick().then(() => {
			element.focus();
		});

		return {
			destroy() {
				element.blur();
			}
		};
	}
</script>

<div class="px-4">
	<section>
		<div class="flex items-center mb-6">
			<h1 class="mr-4 mt-0 text-2xl font-medium leading-tight text-primary font-serif">Play!</h1>
			{#if data.session?.user}
				<button class="btn" on:click={() => (showModal = true)}>Create a puzzle</button>
			{/if}
		</div>
		{#if isCreateSuccess}
			<p class="text-lime-600">
				<span class="font-bold">Success!</span> You just created a new puzzle
				<a class="text-blue-500" href={`/puzzles/${newPuzzleId}/play`}>See it here</a>
			</p>
		{/if}
		{#if puzzles}
			<List type="ul">
				{#each puzzles as puzzle}
					{#if puzzle.publishStatus === PUBLISHED}
						<ListItem>
							<div class="flex items-baseline font-sans">
								<a href="/puzzles/{puzzle._id}/play" class="text-sky-600">{puzzle.title}</a>
								<div class="ml-auto">
									<span class="text-xs text-lime-600 font-medium">PUBLISHED</span>
									<span class="text-xs text-gray-500">{puzzle.puzzleType}</span>
								</div>
							</div>
						</ListItem>
					{:else}
						<ListItem>
							<div class="flex items-baseline font-sans">
								<span>
									{#if puzzle.publishStatus === EDIT_PUZZLE}
										<a href="/puzzles/{puzzle._id}/edit" class="text-sky-400">{puzzle.title}</a>
									{:else if puzzle.publishStatus === EDITING_HINTS}
										<a href="/puzzles/{puzzle._id}/editHints" class="text-sky-400">{puzzle.title}</a
										>
									{/if}</span
								>
								<div class="ml-auto">
									<span class="text-xs text-orange-600 font-medium"
										>{puzzle.publishStatus === EDIT_PUZZLE ? 'MAKE GRID' : 'MAKE HINTS'}</span
									>
									<span class="text-xs text-gray-500">{puzzle.puzzleType}</span>
								</div>
							</div>
						</ListItem>
					{/if}
				{/each}
			</List>
		{/if}
	</section>
</div>

<Modal bind:showModal>
	<div class="px-2 pt-2 pb-8 font-sans">
		<form method="POST" action="?/create" use:enhance>
			<input type="hidden" name="userEmail" value={data?.session?.user?.email} />
			<div class="mb-8">
				<label>
					<input
						size="40"
						type="text"
						placeholder="Give your puzzle a title!"
						name="title"
						class="border-solid border border-gray-400"
						use:autofocus
					/></label
				>
			</div>
			<fieldset class="mb-4">
				<legend class="font-medium leading-tight text-primary font-sans mb-2">Type of puzzle</legend
				>
				<ul class="ml-2 mb-4">
					<li class="mb-2">
						<label><input type="radio" name="size" value={MINI} checked /> Mini (5x5)</label>
					</li>
					<li class="mb-2">
						<label><input type="radio" name="size" value={DAILY} /> Daily (15x15)</label>
					</li>
					<li class="mb-2">
						<label><input type="radio" name="size" value={SUNDAY} /> Sunday (30x30)</label>
					</li>
				</ul>
			</fieldset>

			<div class="flex items-center">
				<button class="btn font-sans">Start Building!</button>{#if form?.error && form?.message}
					<p class="text-red-500 ml-4">{form.message}</p>
				{/if}
			</div>
		</form>
	</div>
</Modal>
