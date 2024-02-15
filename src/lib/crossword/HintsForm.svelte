<script lang="ts">
	import type { EditorPuzzle } from '$utils/types';
	import { BannerType } from '$utils/types';
	import Banner from '$components/Banner.svelte';
	import Hints from '$lib/crossword/EditHints.svelte';

	export let onSaveHints: () => void;
	export let onAcrossHintInput: () => void;
	export let onDownHintInput: () => void;
	export let onConfirmPublish: () => void;
	export let onConfirmRevertToGrid: () => void;
	export let puzzle: EditorPuzzle;
	export let errorMessage: string;
	export let successMessage: string;
	export let showLinkToPlayPage: boolean;
</script>

<form method="POST" action={'?/publish'} autocomplete="off" on:submit|preventDefault={onSaveHints}>
	<input type="hidden" name="id" value={puzzle._id} />
	<input type="hidden" name="acrossHints" value={JSON.stringify(puzzle.acrossHints)} />
	<input type="hidden" name="downHints" value={JSON.stringify(puzzle.downHints)} />
	<Hints {puzzle} {onAcrossHintInput} {onDownHintInput} />

	<!-- ERROR MESSAGES -->
	{#if errorMessage}
		<Banner message={errorMessage} bannerType={BannerType.IS_ERROR} />
	{/if}

	{#if showLinkToPlayPage}
		<a href="/puzzles/{puzzle._id}/play" class="text-sky-400">Play {puzzle.title} now?</a>
	{/if}

	<div class="my-6 flex items-center">
		<div class="mr-4">
			<button
				type="button"
				on:click={onConfirmPublish}
				class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
				>Publish!</button
			>
		</div>
		<div class="mr-4">
			<button
				type="button"
				on:click={onConfirmRevertToGrid}
				class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
				>Go back to editing grid</button
			>
		</div>
		{#if successMessage}
			<p class="text-gray-400 text-sm">{successMessage}</p>
		{/if}
	</div>
</form>
