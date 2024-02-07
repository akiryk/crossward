<script lang="ts">
	import { type PuzzleType, UserMode } from '$utils/types';

	// PROPS
	export let isCreateSuccess: boolean = false;
	export let puzzleType: PuzzleType;
	export let userMode: UserMode;
	export let title: string;

	$: headingText = getHeadingText(userMode, title);

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

<h2 class="font-medium font-sans text-md mb-2">
	{#if isCreateSuccess}
		<span class="text-lime-600">
			Yay, you created a new {puzzleType} puzzle!
		</span>
	{/if}
	{headingText}
</h2>
