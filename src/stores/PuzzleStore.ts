import { writable } from 'svelte/store';
import type { DynamicGrid } from '$utils/types';

const puzzleStore = writable<DynamicGrid | null>(null);

export default puzzleStore;
