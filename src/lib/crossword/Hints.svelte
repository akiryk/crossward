<script lang="ts">
	import type { Hint } from '$utils/types';
	import Button from '$components/Button.svelte';

	export let acrossHints: Array<Hint>;
	export let downHints: Array<Hint>;
</script>

<div class="flex justify-between">
	<div>
		<h2 class="font-bold text-left">Create Across Hints</h2>
		{#each acrossHints as hint}
			<div class="flex items-center my-2">
				<label
					for={`acrossHintFor${hint.displayNumber}`}
					class="block text-sm font-medium text-gray-900 dark:text-black mr-5 w-2"
				>
					{hint.displayNumber}
				</label>
				<input
					type="text"
					placeholder={`${hint.answer}`}
					size={50}
					name="hint"
					id={`acrossHintFor${hint.displayNumber}`}
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
				/>
			</div>
		{/each}
	</div>
	<div>
		<h2 class="font-bold text-left">Create Down Hints</h2>
		{#each downHints as hint}
			<div class="flex items-center my-2">
				<label
					for={`downHintFor${hint.displayNumber}`}
					class="block text-sm font-medium text-gray-900 dark:text-black mr-5 w-2"
				>
					{hint.displayNumber}
				</label>
				<input
					type="text"
					placeholder={`${hint.answer}`}
					size={50}
					name="hint"
					on:input={() => {}}
					id={`downHintFor${hint.displayNumber}`}
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
				/>
			</div>
		{/each}
	</div>
</div>
<div class="mb-5 flex">
	<div class="mr-5">
		<Button buttonType="submit">Save for later</Button>
	</div>
	<button
		formaction="?/publish"
		class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Publish</button
	>
</div>
