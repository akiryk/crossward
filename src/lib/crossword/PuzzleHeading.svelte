<script lang="ts">
	import { type PuzzleType, UserMode } from '$utils/types';

	// PROPS
	export let isCreateSuccess: boolean = false;
	export let puzzleType: PuzzleType;
	export let userMode: UserMode;
	export let title: string;
	export let lastSavedAtMessage: string;
	let previousMessage: string;
	let timerId: ReturnType<typeof setTimeout>;
	let showMessage: boolean = false;

	$: headingText = getHeadingText(userMode, title);
	$: getNewMessage(lastSavedAtMessage);

	function getNewMessage(lastSavedAtMessage: string) {
		if (previousMessage !== lastSavedAtMessage) {
			clearTimeout(timerId);
			previousMessage = lastSavedAtMessage;
			showMessage = true;

			timerId = setTimeout(() => {
				showMessage = false;
			}, 4000);
		}
	}

	function getHeadingText(userMode: UserMode, title: string) {
		switch (userMode) {
			case UserMode.EDITING_CELLS:
				return `Create ${title}`;
			case UserMode.EDITING_HINTS:
				return `Add hints for ${title}`;
			case UserMode.PLAY:
				return `Play ${title}`;
			default:
				return '';
		}
	}
</script>

<div class="flex">
	<h2 class="font-medium font-sans text-md mb-2">
		{#if isCreateSuccess}
			<span class="text-lime-600">
				Yay, you created a new {puzzleType} puzzle!
			</span>
		{/if}
		{@html headingText}
	</h2>
	{#if showMessage}
		<span class="ml-4 text-gray-400">{lastSavedAtMessage}</span>
	{/if}
</div>
