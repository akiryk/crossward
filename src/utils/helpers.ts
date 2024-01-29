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

/**
 * saveHintData
 *
 * Loop through array of chunked hint objects and post each chunk in turn
 */
export async function saveHintData(chunkedData: any[], id: string, direction: HintDirection) {
	chunkedData.forEach(async (chunk) => {
		const formData = new FormData();
		formData.append('chunk', JSON.stringify(chunk));
		formData.append('direction', direction);
		formData.append('id', id);
		try {
			const response = await fetch(`?/updateHintChunks`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Request failed');
			}
		} catch (error) {
			console.error('Error saving chunk:', error);
		}
	});
}
