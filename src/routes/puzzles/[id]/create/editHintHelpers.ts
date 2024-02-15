// [id]/editHints/page.svelte
import { deserialize } from '$app/forms';
import { type ActionResult } from '@sveltejs/kit';

import {
	type HintDirection,
	type EditorPuzzle,
	type Hint,
	type ID,
	type CellMap
} from '$utils/types';
import { promiseDebounce, chunkArray } from '$utils/helpers';

const saveHintData = async (
	chunkedData: Hint[],
	id: string,
	direction: HintDirection
): Promise<{ errors: string[]; successMessage: string }> => {
	let successMessage = '';
	const errors: Array<string> = [];
	for (const chunk of chunkedData) {
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
				errors.push(result.data?.message);
			}
			if (result.type === 'success' && result?.data?.message) {
				successMessage = result.data.message;
			}
		} catch (error) {
			errors.push('Error saving chunk');
		}
	}
	return {
		errors,
		successMessage
	};
};

const debounceSave = promiseDebounce(saveHintData) as (
	chunkedData: Array<any>,
	id: ID,
	direction: string
) => SaveHintResponse;

type SaveHintResponse = Promise<{
	successMessage: string;
	errors: string[];
}>;

export const saveAcrossHintInput = async (
	puzzle: EditorPuzzle
): Promise<{ errors: string[]; successMessage: string }> => {
	if (puzzle === null) {
		return {
			errors: ['No puzzle!'],
			successMessage: ''
		};
	}
	const chunkedData = chunkArray(puzzle.acrossHints, 5);
	const response = await debounceSave(chunkedData, puzzle._id as ID, 'across');
	return {
		successMessage: response.successMessage,
		errors: response.errors
	};
};

export const saveDownHintInput = async (
	puzzle: EditorPuzzle
): Promise<{ errors: string[]; successMessage: string }> => {
	if (puzzle === null) {
		return {
			errors: ['No puzzle!'],
			successMessage: ''
		};
	}
	const chunkedData = chunkArray(puzzle.downHints, 5);
	const response = await debounceSave(chunkedData, puzzle._id as ID, 'down');
	return { successMessage: response.successMessage, errors: response.errors };
};

export const revertToGrid = async (
	puzzle: EditorPuzzle
): Promise<{ success: boolean; cellMap?: CellMap }> => {
	const id = puzzle._id;
	const formData = new FormData();
	formData.append('id', id);
	try {
		const response = await fetch('?/revertToGrid', {
			method: 'POST',
			body: formData
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			return {
				success: true,
				cellMap: result.data?.cellMap
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

export const validatePuzzleCanBePublished = (
	puzzle: EditorPuzzle
): { isValid: boolean; message?: string } => {
	if (
		puzzle.acrossHints.find((data) => !data.hint) ||
		puzzle.downHints.find((data) => !data.hint)
	) {
		return {
			isValid: false,
			message: 'Not every word has a corresponding hint.'
		};
	}
	return {
		isValid: true,
		message: 'Good job!'
	};
};
