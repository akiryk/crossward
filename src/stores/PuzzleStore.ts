import { writable } from 'svelte/store';
import type { Puzzle } from '$utils/types';

const puzzleStore = writable<Puzzle | null>(null);

export default puzzleStore;
