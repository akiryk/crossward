import { writable } from 'svelte/store';
import { Direction } from '$utils/types';
import type { GameShape } from '$utils/types';

const initialStore: GameShape = {
	gridDirection: Direction.GO_RIGHT,
	highlightedCellIds: []
};

const gameStore = writable<GameShape>(initialStore);

export default gameStore;
