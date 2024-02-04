import { writable } from 'svelte/store';
import { Direction } from '$utils/types';
import type { GameContext } from '$utils/types';

const initialStore: GameContext = {
	gridDirection: Direction.GO_RIGHT,
	highlightedCellIds: [],
	twoLetterWordIds: [],
	cellWithFocusId: null,
	activeCellIds: []
};

const gameStore = writable<GameContext>(initialStore);

export default gameStore;
