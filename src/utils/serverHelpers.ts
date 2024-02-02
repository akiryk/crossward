/**
 * serverHelpers
 *
 * Utilities for server actions
 */
import type {
	CellMap,
	Cell,
	CellRows,
	ID,
	EditorPuzzle,
	PlayerPuzzle,
	CellsArray,
	Hint,
	SanitizeInputParams,
	CellMapArray
} from '$utils/types';
import { getId } from './helpers';
import sanitizeHtml from 'sanitize-html';
import mongodb, { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from '../routes/puzzles/[id]/$types';
import { UPDATE_TITLE, DELETE_PUZZLE } from './constants';

type Props = {
	puzzle: EditorPuzzle;
	isCreateSuccess: boolean;
};

export const editpageServerLoad: PageServerLoad = async ({
	params,
	url,
	locals
}): Promise<Props> => {
	let session;
	/**
	 * Redirect unauthorized users to login page!
	 */
	try {
		session = await locals.getSession();
		if (!session) {
			throw new Error('not authenticated');
		}
	} catch {
		redirect(302, '/login');
	}

	/**
	 * Load the puzzle data
	 */
	try {
		const puzzleFromSource = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (puzzleFromSource === null) {
			throw new Error('No puzzle');
		}

		if (puzzleFromSource.authorEmail !== session.user?.email) {
			throw new Error('No access');
		}
		// Create cellRows every time the page loads; otherwise, the cells
		// in cellRows and in cellMap will get out of sync
		const cellRows: CellRows = createCellRows({
			cellMap: puzzleFromSource.cellMap,
			acrossSpan: puzzleFromSource.acrossSpan,
			downSpan: puzzleFromSource.downSpan
		});

		const puzzle = {
			...puzzleFromSource,
			cellRows,
			_id: puzzleFromSource._id.toString()
		} as unknown as EditorPuzzle;
		const create = url.searchParams.get('create');

		return {
			puzzle,
			isCreateSuccess: create === 'true'
		};
	} catch (error) {
		redirect(302, '/');
	}
};

export const handleSanitizeInput = (unsanitizedInput: string) => {
	return sanitizeHtml(unsanitizedInput);
};

// When creating a puzzle (not updating), make a cellMap based on the span
// and populate it with empty values. This ensures we save the new puzzle
// with the same shape it will have once it's updated and finished.
export const createInitialCellMap = (acrossSpan: number, downSpan: number): CellMap => {
	const map: CellMap = {};
	for (let y = 0; y < downSpan; y++) {
		for (let x = 0; x < acrossSpan; x++) {
			const id: ID = `${x}:${y}`;
			const index = y * downSpan + x;
			const cell: Cell = {
				id,
				displayNumber: 0,
				correctValue: '',
				value: '',
				x,
				y,
				index,
				isSymmetrical: false
			};
			map[id] = cell;
		}
	}
	return map;
};

export const removeAnswers = (hints: Array<Hint>) =>
	hints.map((sourceHint) => ({
		hint: sourceHint.hint,
		answer: '',
		displayNumber: sourceHint.displayNumber
	}));

/**
 * createCellRows
 *
 * Create array cell rows to aid in rendering the puzzle
 * Do it once when the puzzle is being created
 */
export function createCellRows({
	acrossSpan,
	downSpan,
	cellMap
}: {
	acrossSpan: number;
	downSpan: number;
	cellMap: CellMap;
}): CellRows {
	const cellRows: CellRows = [];
	for (let y = 0; y < downSpan; y++) {
		const row = [];
		for (let x = 0; x < acrossSpan; x++) {
			const id: ID = getId({ x, y });
			const cell = cellMap[id];
			row.push(cell);
		}
		cellRows.push(row);
	}
	return cellRows;
}

/**
 * transformCellForDb
 *
 * Extract just those fields from a cell:DynamicCell that belong in the database
 * (leave out things like hasFocus is isHightlighted).
 * If completing the grid construction portion of the process, unset the values.
 * Values can still be accessed from cell.correctValue, but we want to leave them out
 * for player mode.
 */
function transformCellForDb({ cell, clearValues }: { cell: Cell; clearValues: boolean }): Cell {
	const {
		id,
		displayNumber,
		correctValue,
		value,
		x,
		y,
		index,
		isSymmetrical,
		acrossWordStartX,
		acrossWordEndX,
		downWordStartY,
		downWordEndY
	} = cell;

	return {
		id,
		displayNumber,
		correctValue,
		value: clearValues ? '' : value,
		x,
		y,
		index,
		isSymmetrical,
		acrossWordStartX,
		acrossWordEndX,
		downWordStartY,
		downWordEndY
	};
}

/**
 * transformCellMapArrayForDb
 *
 * Remove fields from Object.entries(cellMap) that we don't want in the DB
 */
export function transformCellMapArrayForDb({
	cellMapArray
}: {
	cellMapArray: CellMapArray;
}): CellMapArray {
	const newCellMapArray: CellMapArray = cellMapArray.map(([key, cell]) => {
		const newCell = transformCellForDb({ cell, clearValues: false });
		return [key, newCell];
	});
	return newCellMapArray;
}

/**
 * transformPuzzleDataForDb
 *
 * Using the cellMap from the puzzle store, find all the words
 * and save them to either the acrossWords or downWords arrays.
 */
export function transformPuzzleDataForCreatingHints({
	initialCellMap
}: {
	initialCellMap: CellMap;
	clearValues?: boolean;
}): { cellMap: CellMap; acrossHints: Array<Hint>; downHints: Array<Hint> } {
	const cellMap = structuredClone(initialCellMap);
	let cellDisplayNumber = 1;
	const cellsArray: CellsArray = Object.values(cellMap);

	const acrossHints = [];
	const downHints = [];

	// Loop once through all the cells in order to find:
	// - which cells contain words so we can make hints for those words
	// - which ones are at the start of words and get a displayNumber
	// - which ones are in words and get start and end information about each word
	for (let i = 0; i < cellsArray.length; i++) {
		let shouldIncrementCount = false;
		const cell: Cell = cellsArray[i];

		if (!cell.correctValue) {
			continue;
		}

		const { x, y } = cell;
		let word;

		// Find the across words
		const leftCellId: ID = getId({ x: x - 1, y });
		const rightCellId: ID = getId({ x: x + 1, y });

		// If this is the first cell in an across word
		if (!cellMap[leftCellId]?.correctValue && cellMap[rightCellId]?.correctValue) {
			let value = cell.correctValue;
			word = '';
			let currentX = x;

			// Check if it starts a horizontal word
			// The cell starts a word if the previous cell does not have value
			// and the next cell does have value
			while (value) {
				word = `${word}${value}`;
				currentX++;
				const id = getId({ x: currentX, y });
				value = cellMap[id]?.value;
			}
			// Get first/last cells in word to help with highlighting
			const startX = x;
			const endX = currentX;

			// Now loop through all the cells in the finished word
			// so that each one has a reference to first and last cells
			const length = startX + (endX - startX);
			for (let j = startX; j < length; j++) {
				const currentCell = cellMap[`${j}:${y}`];
				cellMap[`${j}:${y}`] = {
					...currentCell,
					acrossWordStartX: startX,
					acrossWordEndX: endX - 1
				};
			}

			const hint: Hint = {
				displayNumber: cellDisplayNumber,
				hint: '',
				answer: word
			};
			acrossHints.push(hint);
			shouldIncrementCount = true;
		}

		// Down Words
		const aboveCellId: ID = getId({ x, y: y - 1 });
		const bottomCellId: ID = getId({ x, y: y + 1 });
		if (!cellMap[aboveCellId]?.correctValue && cellMap[bottomCellId]?.correctValue) {
			let value = cell.correctValue;
			word = '';
			let currentY = y;

			// Check if it starts a horizontal word
			// The cell starts a word if the previous cell does not have value
			// and the next cell does have value
			while (value) {
				word = `${word}${value}`;
				currentY++;
				const id = getId({ x, y: currentY });
				value = cellMap[id]?.value;
			}

			// Get first/last cells in word to help with highlighting
			const startY = y;
			const endY = currentY;

			// Loop through all the cells in the finished word
			// so that each one has a reference to first and last cells
			const length = startY + (endY - startY);
			for (let k = startY; k < length; k++) {
				const currentCell = cellMap[`${x}:${k}`];
				cellMap[`${x}:${k}`] = {
					...currentCell,
					downWordStartY: startY,
					downWordEndY: endY - 1
				};
			}

			const hint: Hint = {
				displayNumber: cellDisplayNumber,
				hint: '',
				answer: word
			};

			downHints.push(hint);
			shouldIncrementCount = true;
		}

		if (shouldIncrementCount) {
			cellMap[cell.id].displayNumber = cellDisplayNumber;
			cellDisplayNumber++;
		}
	}

	return { cellMap, acrossHints, downHints };
}

// Hints are only valid if all have been filled in; otherwise we can't publish the game
export const validateHintsForPublishingPuzzle = (
	acrossHints: Array<Hint>,
	downHints: Array<Hint>
): boolean => {
	if (typeof acrossHints === 'undefined' || typeof downHints === 'undefined') {
		return false;
	}
	let isValid = true;
	const allHints = [...acrossHints, ...downHints];
	let i = allHints.length;
	while (i > 0) {
		if (!allHints[i - 1].hint) {
			isValid = false;
			break;
		}
		i--;
	}
	return isValid;
};

export const handleDeletePuzzle = async (request: Request) => {
	try {
		const data = await request.formData();
		const id = data.get('id');
		if (typeof id === 'string') {
			const query = { _id: new mongodb.ObjectId(id) };
			const isDeleted = await puzzlesCollection.deleteOne(query);
			if (!isDeleted) {
				throw new Error('Unable to delete that puzzle.');
			}
		} else {
			throw new Error('Missing ID for delete puzzle.');
		}
	} catch (error) {
		// throw new Error(getErrorMessage(error));
		const message = getErrorMessage(error);
		return fail(500, {
			error: true,
			action: DELETE_PUZZLE,
			message
		});
	}
	redirect(302, `/puzzles?isDeleteSuccess=true`);
};

export const handleUpdateTitle = async (request: Request) => {
	let id: FormDataEntryValue | null;
	let title: FormDataEntryValue | null;
	try {
		const data = await request.formData();
		id = data.get('id');
		if (!id || typeof id !== 'string') {
			return fail(400, {
				error: true,
				action: UPDATE_TITLE,
				message: 'Missing ID field. Lodge a complaint with the developers.'
			});
		}
		const unsafeTitle = data.get('title');
		if (!unsafeTitle) {
			throw new Error();
		}
		title = handleSanitizeInput(unsafeTitle?.toString());
	} catch {
		return fail(400, { error: true, action: UPDATE_TITLE, message: 'Please add a title' });
	}
	try {
		const filter = {
			_id: new ObjectId(id)
		};

		// Specify the update to set a value for the plot field
		const updateDocument = {
			$set: {
				title
			}
		};
		await puzzlesCollection.updateOne(filter, updateDocument);
		return {
			message: `Saved new title: ${title}`,
			action: UPDATE_TITLE,
			success: true
		};
	} catch (error) {
		return fail(500, {
			error: true,
			action: UPDATE_TITLE,
			message: 'Unable to save the new title'
		});
	}
};

export function getErrorMessage(error: unknown, fallback?: string): string {
	if (error instanceof Error) return error.message;
	return fallback ? fallback : String(error);
}
