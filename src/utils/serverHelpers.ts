/**
 * serverHelpers
 *
 * Utilities for server actions
 */
import type {
	CellMap,
	DynamicCellMap,
	Cell,
	ID,
	Puzzle,
	DynamicCell,
	PuzzleWithId,
	CellsArray,
	Hint,
	SanitizeInputParams,
	DynamicCellMapArray,
	CellMapArray
} from '$utils/types';
import { Direction, ServerErrorType } from '$utils/types';
import { getId } from './helpers';
import sanitizeHtml from 'sanitize-html';
import mongodb, { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad, RequestEvent } from '../routes/puzzles/[id]/$types';

export const pageServerLoad: PageServerLoad = async ({ params, url, locals }): Promise<any> => {
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
		const puzzleFromDb = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (puzzleFromDb === null) {
			throw new Error('No puzzle');
		}

		if (puzzleFromDb.authorEmail !== session.user?.email) {
			throw new Error('No access');
		}

		try {
			const puzzleWithId = {
				...puzzleFromDb,
				_id: puzzleFromDb._id.toString()
			} as unknown as PuzzleWithId;
			const puzzle = transformPuzzleForClient(puzzleWithId);
			const create = url.searchParams.get('create');

			return {
				puzzle,
				isCreateSuccess: create === 'true'
			};
		} catch (error) {
			return fail(422, {
				error
			});
		}
	} catch (error) {
		redirect(302, '/');
	}
};

export const handleUpdateTitle = async ({ request }: RequestEvent) => {
	const data = await request.formData();
	const originalTitle = data.get('originalTitle');
	const newTitle = handleSanitizeInput({
		data,
		inputName: 'title',
		fallback: new Date().toLocaleString()
	});

	try {
		const filter = { title: originalTitle };
		// Specify the update to set a value for the plot field
		const updateDocument = {
			$set: {
				title: newTitle
			}
		};
		await puzzlesCollection.updateOne(filter, updateDocument);

		return {
			title: newTitle,
			success: true
		};
	} catch (error) {
		return fail(422, {
			errorType: ServerErrorType.UPDATE_TITLE_DB_ERROR,
			message: 'Oops, unable to update the title!'
		});
	}
};

export const handleDelete = async ({ request }: RequestEvent) => {
	const data = await request.formData();
	try {
		const id = data.get('id');
		if (typeof id === 'string') {
			const query = { _id: new mongodb.ObjectId(id) };
			const isDeleted = await puzzlesCollection.deleteOne(query);
			if (!isDeleted) {
				throw new Error();
			}
		}
	} catch {
		throw new Error('Error: Unable to delete this puzzle');
	}
	redirect(302, `/puzzles?isDeleteSuccess=true`);
};

export const handleSanitizeInput = ({ data, inputName, fallback }: SanitizeInputParams) => {
	const unsanitizedInput = data.get(inputName) || fallback;
	if (typeof unsanitizedInput !== 'string') {
		throw new Error('Oops! Title must be some text or left empty');
	}
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

// We only save data to the database that we need to have there, but we
// need a bunch of other data when working in the client.
// E.g. we need to save the cells' values to the db but we don't want
// to save the currently selected cell
export const transformPuzzleForClient = (puzzle: PuzzleWithId): Puzzle => {
	const cellWithFocus = null;
	const gridDirection = Direction.GO_RIGHT;
	const highlightedCellIds: Array<ID> = [];
	const { cellRows, dynamicCellMap } = createCellArraysForClient(puzzle);
	const dynamicPuzzle = {
		...puzzle,
		cellMap: dynamicCellMap,
		cellRows,
		cellWithFocus,
		gridDirection,
		highlightedCellIds
	};
	return dynamicPuzzle;
};

export const transformPuzzleForPlayer = (puzzle) => {
	const cellWithFocus = null;
	const gridDirection = Direction.GO_RIGHT;
	const highlightedCellIds: Array<ID> = [];
	const { cellRows, dynamicCellMap } = createCellArraysForClient(puzzle);
	const dynamicPuzzle = {
		...puzzle,
		downHints: removeAnswers(puzzle.downHints),
		acrossHints: removeAnswers(puzzle.acrossHints),
		cellMap: dynamicCellMap,
		cellRows,
		cellWithFocus,
		gridDirection,
		highlightedCellIds
	};
	return dynamicPuzzle;
};

const removeAnswers = (hints: Array<Hint>) =>
	hints.map((sourceHint) => ({
		hint: sourceHint.hint,
		answer: '',
		displayNumber: sourceHint.displayNumber
	}));

/**
 * createCellArraysForClient
 *
 * Create array cell rows to aid in rendering the puzzle
 */
function createCellArraysForClient(puzzle: PuzzleWithId) {
	const { acrossSpan, downSpan, cellMap } = puzzle;

	const cellRows = [];
	const dynamicCellMap: DynamicCellMap = {};
	for (let y = 0; y < downSpan; y++) {
		const row = [];
		for (let x = 0; x < acrossSpan; x++) {
			const id: ID = `${x}:${y}`;
			const cell = cellMap[id];
			const dynamicCell: DynamicCell = {
				...cell,
				hasFocus: false
			};
			dynamicCellMap[id] = dynamicCell;
			row.push(dynamicCell);
		}
		cellRows.push(row);
	}
	return { cellRows, dynamicCellMap };
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
function transformCellForDb({
	cell,
	clearValues
}: {
	cell: DynamicCell;
	clearValues: boolean;
}): Cell {
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
	cellMapArray: DynamicCellMapArray;
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
