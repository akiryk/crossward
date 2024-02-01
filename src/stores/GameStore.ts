import { writable } from 'svelte/store';
import type { GameStore } from '$utils/types';

const gameStore = writable<GameStore>(null);

export default gameStore;
