<script lang="ts">
	import type { CellMap, ID } from '$utils/types';
	import { BannerType, UserMode } from '$utils/types';
	import { clickOutside } from '$utils/useClickOutside';
	import GameStore from '../../stores/GameStore';
	import Crossword from './Crossword.svelte';
	import Banner from '$components/Banner.svelte';

	export let onSubmit: (event: Event) => void;
	export let onInput: (id: ID) => void;
	export let onValidateGridIsReadyForHints: () => void;
	export let onTogglePreview: (event: Event) => void;
	export let cellMap: CellMap;
	export let id: string;
	export let isPreview: boolean;
	export let userMode: UserMode;
	export let errorMessage: string;
	export let onResetErrorMessage: () => void;

	function handleClickOutside() {
		GameStore.update((current) => ({
			...current,
			highlightedCellIds: []
		}));
	}
</script>

<form method="POST" action="?/updateCellMap" autocomplete="off" on:submit|preventDefault={onSubmit}>
	<input type="hidden" name="cellMap" value={JSON.stringify(cellMap)} />
	<input type="hidden" name="id" value={id} />
	<div class="mb-10 w-fit flex" use:clickOutside={{ callback: handleClickOutside }}>
		<Crossword {isPreview} {userMode} {onInput} />
	</div>
	<!-- ERROR MESSAGES -->
	{#if errorMessage}
		<div class="mb-10">
			<Banner
				message={errorMessage}
				bannerType={BannerType.IS_ERROR}
				onClose={onResetErrorMessage}
			/>
		</div>
	{/if}
	{#if userMode === UserMode.EDITING_CELLS}
		<div class="mb-5 flex items-center">
			<button
				type="button"
				on:click={onValidateGridIsReadyForHints}
				class="text-gray-900 mr-10 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5"
				>Make Hints</button
			>

			<label for="togglePreview">
				<input id="togglePreview" type="checkbox" on:change={onTogglePreview} />
				Toggle Preview Mode
			</label>
		</div>
	{/if}
</form>
