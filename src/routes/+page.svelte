<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData, ActionData } from './$types';
	import type { Puzzles } from '$utils/types';
	import { EDIT_PUZZLE, PUBLISHED, MINI, DAILY, SUNDAY, EDITING_HINTS } from '$utils/constants';

	import List from '$components/List.svelte';
	import ListItem from '$components/ListItem.svelte';
	import Button from '$components/Button.svelte';

	export let puzzles: Puzzles | undefined;
	export let data: PageData;
	export let form: ActionData & {
		error?: boolean;
		message?: string;
	};

	$: ({ puzzles } = data);
</script>

<div class="p-4">
	<section>
		<h1 class="mb-2 mt-0 text-2xl font-medium leading-tight text-primary font-inria">Play!</h1>
		<div
			class="hidden bg-slate-100 px-2 pt-2 pb-8 border-solid border border-gray-200 sm:max-w-lg bg-gray"
		>
			<h2 class="my-2 text-md font-medium font-inria-serif">Create a puzzle</h2>
			<form method="POST" action="?/create" use:enhance>
				<input type="hidden" name="userEmail" value={data?.session?.user?.email} />
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
				<fieldset>
					<legend>What size of puzzle? </legend>
					Puzzle size?
					<ul>
						<li>
							<label><input type="radio" name="size" value={MINI} checked /> Mini (5x5)</label>
						</li>
						<li>
							<label><input type="radio" name="size" value={DAILY} /> Daily (15x15)</label>
						</li>
						<li>
							<label><input type="radio" name="size" value={SUNDAY} /> Sunday (30x30)</label>
						</li>
					</ul>
				</fieldset>

				<div class="flex items-center">
					<Button style="primary">Start Building!</Button>{#if form?.error && form?.message}
						<p class="text-red-500 ml-4">{form.message}</p>
					{/if}
				</div>
			</form>
		</div>
		{#if puzzles}
			<List type="ul">
				{#each puzzles as puzzle}
					{#if puzzle.publishStatus === PUBLISHED}
						<ListItem>
							<div class="flex items-baseline font-inria-sans">
								<a href="/puzzles/{puzzle._id}/play" class="text-sky-600">{puzzle.title}</a>
								<div class="ml-auto">
									<span class="text-xs text-lime-600 font-medium">PUBLISHED</span>
									<span class="text-xs text-gray-500">2/5/2024</span>
								</div>
							</div>
						</ListItem>
					{:else if puzzle.authorEmail === data.session?.user?.email}
						<ListItem>
							<span>
								{#if puzzle.publishStatus === EDIT_PUZZLE}
									<a href="/puzzles/{puzzle._id}/editGrid" class="text-sky-400"
										>Edit cells: {puzzle.title}</a
									>
								{:else if puzzle.publishStatus === EDITING_HINTS}
									<a href="/puzzles/{puzzle._id}/editHints" class="text-sky-400"
										>Edit hints: {puzzle.title}</a
									>
								{/if}</span
							>
						</ListItem>
					{/if}
				{/each}
			</List>
		{/if}
	</section>
</div>
