import { writable } from 'svelte/store';
import type { EditorPuzzle, PlayerPuzzle } from '$utils/types';

const puzzleStore = writable<EditorPuzzle | PlayerPuzzle | null>(null);

export default puzzleStore;
