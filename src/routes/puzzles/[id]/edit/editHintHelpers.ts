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

export const confirmRevertToGrid = () => {
	showModal = true;
	modalContentType = REVERT_TO_GRID;
};

const handleRevertToGrid = async () => {
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
			goto(`/puzzles/${id}/edit`);
		}
	} catch {
		console.log('error changing status');
	}
};

export const confirmPublish = () => {
	showModal = true;
	modalContentType = PUBLISH_PUZZLE;
};

const handlePublish = async () => {
	await handleSaveHints();
	const id = puzzle._id;
	const formData = new FormData();
	formData.append('id', id);
	try {
		const response = await fetch('?/publish', {
			method: 'POST',
			body: formData
		});
		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			successMessage = result.data?.message;
			goto(`/?create=true&newPuzzleId=${id}`);
		} else if (result.type === 'failure') {
			errorMessage = result.data?.message;
		}
	} catch (error) {
		errorMessage = 'Please try again soon.';
	}
};
