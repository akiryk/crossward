// [id]/editHints/page.svelte
import { deserialize } from '$app/forms';
import { type ActionResult } from '@sveltejs/kit';

import { type HintDirection, type EditorPuzzle, type Hint, type ID } from '$utils/types';
import { promiseDebounce, chunkArray } from '$utils/helpers';

const saveHintData = async (
	chunkedData: Hint[],
	id: string,
	direction: HintDirection
): Promise<{ success: boolean; errorMessage: string; successMessage: string }> => {
	let success: boolean = true;
	let errorMessage = '';
	let successMessage = '';
	chunkedData.forEach(async (chunk) => {
		const formData = new FormData();
		formData.append('chunk', JSON.stringify(chunk));
		formData.append('direction', direction);
		formData.append('id', id);
		try {
			const response = await fetch(`?/updateHints`, {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'failure') {
				success = false;
				errorMessage = `${errorMessage} ${result.data?.message}`;
			}
			if (result.type === 'success' && result?.data?.message) {
				successMessage = result.data.message;
			}
		} catch (error) {
			error = 'Error saving chunk';
		}
	});
	return {
		success,
		successMessage,
		errorMessage
	};
};

const debounceSave = promiseDebounce(saveHintData) as (
	chunkedData: Array<any>,
	id: ID,
	direction: string
) => SaveHintResponse;

type SaveHintResponse = Promise<{
	success: boolean;
	successMessage: string;
	errorMessage: string;
}>;

export const saveAcrossHintInput = async (
	puzzle: EditorPuzzle
): Promise<{ success: boolean; errorMessage?: string; successMessage?: string }> => {
	if (puzzle === null) {
		return {
			success: false
		};
	}
	const chunkedData = chunkArray(puzzle.acrossHints, 5);
	const response = await debounceSave(chunkedData, puzzle._id as ID, 'across');
	console.log('response', response);
	return {
		success: response.success,
		successMessage: response.successMessage,
		errorMessage: response.errorMessage
	};
};

export const saveDownHintInput = async (
	puzzle: EditorPuzzle
): Promise<{ success: boolean; errorMessage?: string; successMessage?: string }> => {
	if (puzzle === null) {
		return {
			success: false
		};
	}
	const chunkedData = chunkArray(puzzle.downHints, 5);
	return await debounceSave(chunkedData, puzzle._id as ID, 'down');
};

export const revertToGrid = async (puzzle: EditorPuzzle): Promise<{ success: boolean }> => {
	const id = puzzle._id;
	const formData = new FormData();
	formData.append('id', id);
	try {
		const response = await fetch('?/returnToGrid', {
			method: 'POST',
			body: formData
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			return {
				success: true
			};
		}
	} catch {
		console.log('error changing status');
	}
	return {
		success: false
	};
};

export const publish = async (
	puzzle: EditorPuzzle
): Promise<{ success: string; error: string }> => {
	// first save all the hint data
	await saveAcrossHintInput(puzzle);
	await saveDownHintInput(puzzle);

	// now save the puzzle's status as published
	const id = puzzle._id;
	const formData = new FormData();
	let success = '';
	let error = '';
	formData.append('id', id);
	try {
		const response = await fetch('?/publish', {
			method: 'POST',
			body: formData
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			success = result.data?.message;
		} else if (result.type === 'failure') {
			error = result.data?.message;
		}
	} catch (error) {
		error = 'Please try again soon.';
	}
	return {
		success,
		error
	};
};
