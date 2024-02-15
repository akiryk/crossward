// [id]/editHints/page.svelte
import { goto } from '$app/navigation';
import { deserialize } from '$app/forms';
import { type ActionResult } from '@sveltejs/kit';

import { type HintDirection, type EditorPuzzle, type Hint } from '$utils/types';
import { promiseDebounce, chunkArray } from '$utils/helpers';

const REVERT_TO_GRID = 'REVERT_TO_GRID';
const PUBLISH_PUZZLE = 'PUBLISH_PUZZLE';

const saveHintData = async (chunkedData: Hint[], id: string, direction: HintDirection) => {
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
			// if (result.type === 'failure') {
			// 	errorMessage = result.data?.message;
			// }
			// if (result.type === 'success' && result?.data?.message) {
			// 	lastSavedAtMessage = result.data.message;
			// }
		} catch (error) {
			console.error('Error saving chunk:', error);
		}
	});
};

const debounceSave = promiseDebounce(saveHintData);

export const saveAcrossHintInput = async (puzzle: EditorPuzzle) => {
	if (puzzle === null) {
		return;
	}
	const chunkedData = chunkArray(puzzle.acrossHints, 5);
	await debounceSave(chunkedData, puzzle._id, 'across');
};

export const saveDownHintInput = async (puzzle: EditorPuzzle) => {
	if (puzzle === null) {
		return;
	}
	const chunkedData = chunkArray(puzzle.downHints, 5);
	await debounceSave(chunkedData, puzzle._id, 'down');
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
