/**
 * General Helpers for all files
 */
import type { ID } from '$utils/types';
import { DEBOUNCE_DEFAULT_DELAY } from '$utils/constants';

export function getId({ x, y }: { x: number; y: number }): ID {
	return `${x}:${y}`;
}

export const debounce = <T extends unknown[]>(
	callback: (...args: T) => void,
	wait = DEBOUNCE_DEFAULT_DELAY
) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: T) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			callback(...args);
		}, wait);
	};
};

export const promiseDebounce = <T extends unknown[]>(
	callback: (...args: T) => void,
	wait = DEBOUNCE_DEFAULT_DELAY
) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: T) => {
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

export const chunkArray = <T extends unknown[]>(arr: T, chunkSize: number): T[][] => {
	const chunks = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		chunks.push(arr.slice(i, i + chunkSize));
	}
	return chunks;
};
