<script lang="ts">
	import {
		MISSING_SYMMETRY,
		TWO_LETTER_WORDS,
		PUZZLE_INCOMPLETE,
		REVERT_TO_GRID,
		PUBLISH_PUZZLE,
		MISSING_HINTS
	} from '$utils/constants';

	export let modalContentType: string;
	export let onSaveGridAndCreateHints: () => void;
	export let onRevertToGrid: () => void;
	export let onPublish: () => void;
	export let onCloseModal: () => void;
	export let percentOfCompleteCells: string;
</script>

{#if modalContentType === MISSING_SYMMETRY}
	<h2 class="mr-4 mb-4">Rotational symmetry, anyone?</h2>
	<p class="mr-4 mb-4">
		This puzzle doesn't have rotational symmetry. You can still publish it, but it might not look
		up-to-standards.
	</p>
	<p class="mr-4 mb-4">
		Try enabling "toggle preview mode" to identify problem areas (red cells are for incomplete
		symmetry and pink cells are for two-letter words)
	</p>
	<button
		type="button"
		on:click={() => {
			onSaveGridAndCreateHints();
			onCloseModal();
		}}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Make Hints Anyway!</button
	>
{:else if modalContentType === TWO_LETTER_WORDS}
	<p class="mb-4">
		Your puzzle has one or more two-letter words, which isn't really super cool. You can still do
		it, but. Just saying.
	</p>
	<button
		type="button"
		on:click={() => {
			onSaveGridAndCreateHints();
			onCloseModal();
		}}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Make Hints Anyway!</button
	>
{:else if modalContentType === PUZZLE_INCOMPLETE}
	<p class="mb-4">Lazy. Bones.</p>
	<p class="mb-4">
		Only about {percentOfCompleteCells}% of cells in this puzzle have content. Aim for at least 75%.
	</p>
	<button
		type="button"
		on:click={() => {
			onSaveGridAndCreateHints();
			onCloseModal();
		}}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Make Hints Anyway!</button
	>
{:else if modalContentType === PUBLISH_PUZZLE}
	<p class="mr-4 mb-4">Are you sure you're ready to publish?</p>
	<p class="mr-4 mb-4">
		You won't be able to undo it. Once it's published, it's, like... published. Hundreds of millions
		if not billions of people will see it.
	</p>
	<button
		type="button"
		on:click={() => {
			onPublish();
			onCloseModal();
		}}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Yes, Publish!</button
	>
{:else if modalContentType === REVERT_TO_GRID}
	<p class="mb-4">
		You can go back to editing the grid, but you'll lose your hints. Are you sure you want to do
		that?
	</p>
	<button
		type="button"
		on:click={() => {
			onRevertToGrid();
			onCloseModal();
		}}
		class="mr-4 mb-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
		>Yes, Edit Grid!</button
	>
{:else if modalContentType === MISSING_HINTS}
	<p class="mb-4">Tsk tsk, sloppy work.</p>
	<p class="mb-4">You haven't added hints for all of your words. Please add hints and try again.</p>
{/if}
