/**
 * General Helpers for all files
 */
import type { ID } from '$utils/types';

export function getId({ x, y }: { x: number; y: number }): ID {
	return `${x}:${y}`;
}

// @ts-ignore
export const debounce = (callback, wait) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	// @ts-ignore
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			callback.apply(null, args);
		}, wait);
	};
};
