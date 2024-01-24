<script lang="ts">
	import { type PuzzleType, GameStatus } from '$utils/types';
	// PROPS
	export let isCreateSuccess: Boolean = false;
	export let puzzleType: PuzzleType;
	export let gameStatus: GameStatus;
	export let title: string;

	$: headingText = getHeadingText(gameStatus, title);

	function getHeadingText(gameStatus: GameStatus, title: string) {
		switch (gameStatus) {
			case GameStatus.EDIT_GRID:
				return `Create ${title}`;
			case GameStatus.EDIT_HINTS:
				return 'Create hints';
			case GameStatus.PLAY:
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
