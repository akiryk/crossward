/**
 * General Helpers for all files
 */
import type { ID, HintDirection } from '$utils/types';
import { DEBOUNCE_DEFAULT_DELAY } from '$utils/constants';

export function getId({ x, y }: { x: number; y: number }): ID {
	return `${x}:${y}`;
}

// @ts-ignore
export const debounce = (callback, wait = DEBOUNCE_DEFAULT_DELAY) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	// @ts-ignore
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			callback.apply(null, args);
		}, wait);
	};
};

// @ts-ignore
export const promiseDebounce = (callback, wait = DEBOUNCE_DEFAULT_DELAY) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	// @ts-ignore
	return (...args) => {
		return new Promise((resolve, reject) => {
			const later = () => {
				try {
					resolve(callback(...args));
				} catch (error) {
					reject(error);
				}
			};

			clearTimeout(timeoutId);
			timeoutId = setTimeout(later, wait);
		});
	};
};

export const chunkArray = (arr: Array<any>, chunkSize: number): any[][] => {
	const chunks = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunks.push(arr.slice(i, i + chunkSize));
	}
	return chunks;
};
