<script lang="ts">
	import { type PuzzleType, GameStatus } from '$utils/types';
	// PROPS
	export let isCreateSuccess: Boolean = false;
	export let puzzleType: PuzzleType;
	export let gameStatus: GameStatus;
	export let title: string;

	$: headingText = getHeadingText(gameStatus);

	function getHeadingText(gameStatus: GameStatus) {
		switch (gameStatus) {
			case GameStatus.EDIT_GRID:
				return 'Create the Puzzle';
			case GameStatus.EDIT_HINTS:
				return 'Create hints';
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
	{headingText}<span class="font-light text-gray-400 pl-3">{title}</span>
</h2>
