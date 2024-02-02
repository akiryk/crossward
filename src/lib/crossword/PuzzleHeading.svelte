<script lang="ts">
	import { type PuzzleType, UserMode } from '$utils/types';

	// PROPS
	export let isCreateSuccess: Boolean = false;
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

{#if isCreateSuccess}
	<p class="text-lime-600 font-medium mb-3">
		Yay, you created a new {puzzleType} puzzle!
	</p>
{/if}

<h2 class="font-medium text-xl mb-3">
	{headingText}
</h2>
