import { get } from 'svelte/store';
import { deserialize } from '$app/forms';
import { type ActionResult } from '@sveltejs/kit';
import { getId, chunkArray, promiseDebounce } from '$utils/helpers';
import GameStore from '../../../../stores/GameStore';
import {
	DEFAULT_CHUNK_SIZE,
	MISSING_SYMMETRY,
	TWO_LETTER_WORDS,
	PUZZLE_INCOMPLETE
} from '$utils/constants';
import {
	UserMode,
	BannerType,
	type EditorPuzzle,
	type CellMapArray,
	type ID,
	type GameContext,
	type CellMap
} from '$utils/types';

// Every cell with a value should have radial symmetry
// with another cell with a value; e.g. if the upper-left corner has a value
// the lower-right corner must also have a value
export const findIfPuzzleFailsRotationalSymmetry = (cellMap: CellMap): boolean =>
	Object.values(cellMap).some((cell) => cell.isSymmetrical && !cell.correctValue);

// Add all words that are less than 3 characters to GameStore's list of ids to be
// highlighted in preview mode.
export function findWordsThatAreTooShort(cellMap: CellMap, activeCellIds: Array<ID>): Array<ID> {
	const twoLetterWordIds: Array<ID> = [];
	for (let i = 0; i < activeCellIds.length; i++) {
		const cell = cellMap[activeCellIds[i]];
		// The following is likely unnecessary, since activeCellIds should only be IDs of
		// cells that have a correctValue.
		if (!cell.correctValue) continue;

		const { x, y, id: cellId } = cell;

		// Find the down words
		const aboveCellId: ID = getId({ x, y: y - 1 });
		const secondDownCell: ID = getId({ x, y: y + 1 });
		const thirdDownCell: ID = getId({ x, y: y + 2 });
		// Find the across cells
		const leftCellId: ID = getId({ x: x - 1, y });
		const secondRightCell: ID = getId({ x: x + 1, y });
		const thirdRightCell: ID = getId({ x: x + 2, y });

		// This is a 2-letter word if:
		// - the above-side cell is empty,
		// - the down-side cell has content
		// - the cell below that is empty
		if (
			!cellMap[aboveCellId]?.correctValue &&
			cellMap[secondDownCell]?.correctValue &&
			!cellMap[thirdDownCell]?.correctValue
		) {
			if (!twoLetterWordIds.includes(cellId)) {
				twoLetterWordIds.push(cellId);
			}
			if (!twoLetterWordIds.includes(secondDownCell)) {
				twoLetterWordIds.push(secondDownCell);
			}
		}

		// This is a 2-letter word if:
		// - the left-side cell is empty,
		// - the across-side cell has content
		// - the cell below that is empty
		if (
			!cellMap[leftCellId]?.correctValue &&
			cellMap[secondRightCell]?.correctValue &&
			!cellMap[thirdRightCell]?.correctValue
		) {
			if (!twoLetterWordIds.includes(cellId)) {
				twoLetterWordIds.push(cellId);
			}
			if (!twoLetterWordIds.includes(secondRightCell)) {
				twoLetterWordIds.push(secondRightCell);
			}
		}
	}
	return twoLetterWordIds;
}

export function getActiveCellIdsFromCellMap(cellMap: CellMap): Array<ID> {
	const activeCellIds: Array<ID> = [];
	Object.values(cellMap).forEach((cell) => {
		if (cell.correctValue) {
			activeCellIds.push(cell.id);
		}
	});
	return activeCellIds;
}

export const togglePreview = ({
	event,
	puzzle
}: {
	event: Event;
	puzzle: EditorPuzzle;
}): boolean => {
	let isPreview = false;
	if ((event.target as HTMLInputElement).checked) {
		setTimeout(() => {
			const { activeCellIds } = get(GameStore);
			const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
			GameStore.update((current: GameContext) => {
				return {
					...current,
					twoLetterWordIds
				};
			});
		}, 0);
		isPreview = true;
	} else {
		isPreview = false;
	}
	return isPreview;
};

export async function saveData(
	data: FormData
): Promise<{ errorMessage: string; successMessage: string } | null> {
	const formCellMap = data?.get('cellMap');
	const id = data?.get('id');
	if (typeof formCellMap !== 'string' || typeof id !== 'string') {
		return null;
	}
	const cellsArray: CellMapArray = Object.entries(JSON.parse(formCellMap));
	const chunkedData = chunkArray(cellsArray, DEFAULT_CHUNK_SIZE);

	let successMessage = '';
	let errorMessage = '';

	chunkedData.forEach(async (chunk) => {
		// chunk = [["0:0", cell1], ["0:1", cell2], etc ... ]
		const formData = new FormData();
		formData.append('chunk', JSON.stringify(chunk));
		formData.append('id', id);
		try {
			const response = await fetch(`?/updateCellMap`, {
				method: 'POST',
				body: formData
			});
			const result: ActionResult = deserialize(await response.text());
			if (result.type === 'success') {
				successMessage = result.data?.message;
				// rerun all `load` functions, following the successful update
				// await invalidateAll();
			} else if (result.type === 'failure') {
				errorMessage = result.data?.message;
			}
		} catch (error) {
			console.error('Error saving chunk:', error);
		}
	});

	return {
		errorMessage,
		successMessage
	};
}

export const validateGridIsReadyForHints = async (
	puzzle: EditorPuzzle
): Promise<{ showModal: boolean; modalContentType?: string; percentOfCompleteCells?: string }> => {
	const { activeCellIds } = get(GameStore);

	let percentOfCompleteCells: string = '';

	// 1. Check for a mostly incomplete puzzle in which less than 50% of the cells have values
	let percentComplete = activeCellIds.length / Object.keys(puzzle.cellMap).length;
	if (percentComplete < 0.5) {
		percentOfCompleteCells = (percentComplete * 100).toFixed();
		return {
			showModal: true,
			modalContentType: PUZZLE_INCOMPLETE,
			percentOfCompleteCells
		};
	}

	// 2 Check rotational symmetry
	if (findIfPuzzleFailsRotationalSymmetry(puzzle.cellMap)) {
		return {
			showModal: true,
			modalContentType: MISSING_SYMMETRY
		};
	}

	// 3. Check for two-letter words
	const twoLetterWordIds = findWordsThatAreTooShort(puzzle.cellMap, activeCellIds);
	GameStore.update((current: GameContext) => {
		return {
			...current,
			twoLetterWordIds
		};
	});
	if (twoLetterWordIds.length > 0) {
		return {
			showModal: true,
			modalContentType: TWO_LETTER_WORDS
		};
	}

	return {
		showModal: false
	};
};

export async function createHints(
	puzzle: EditorPuzzle
): Promise<{ success: boolean; message?: string; data: any } | null> {
	if (puzzle === null) {
		return null;
	}
	let success = false;
	let message = '';
	let data = null;

	const formData = new FormData();
	const id = puzzle._id;
	formData.append('id', id);
	try {
		const response = await fetch(`?/createHints`, {
			method: 'POST',
			body: formData
		});

		const result: ActionResult = deserialize(await response.text());

		if (result.type === 'success') {
			success = true;
			data = result.data;
		} else if (result.type === 'failure') {
			message = result.data?.message;
		}
	} catch (error) {
		message = 'Error saving hints';
	}
	return {
		success,
		message,
		data
	};
}
