<script lang="ts">
	import { type PuzzleType, GameMode } from '$utils/types';

	// PROPS
	export let isCreateSuccess: Boolean = false;
	export let puzzleType: PuzzleType;
	export let gameMode: GameMode;
	export let title: string;

	$: headingText = getHeadingText(gameMode, title);

	function getHeadingText(gameMode: GameMode, title: string) {
		switch (gameMode) {
			case GameMode.EDITING_CELLS:
				return `Create ${title}`;
			case GameMode.EDITING_HINTS:
				return `Add hints for ${title}`;
			case GameMode.PLAY:
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
