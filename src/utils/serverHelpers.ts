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
	SanitizeInputParams
} from '$utils/types';
import { Direction } from '$utils/types';
import { getId } from './helpers';
import sanitizeHtml from 'sanitize-html';

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
	const currentRow = -1;
	const currentColumn = -1;
	const workingAnswersKey = {};
	const highlightedCellIds: Array<ID> = [];
	const { cellRows, dynamicCellMap } = createCellArraysForClient(puzzle);

	const dynamicPuzzle = {
		...puzzle,
		cellMap: dynamicCellMap,
		cellRows,
		cellWithFocus,
		gridDirection,
		currentRow,
		currentColumn,
		workingAnswersKey,
		highlightedCellIds
	};

	return dynamicPuzzle;
};

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
	const { id, displayNumber, correctValue, value, x, y, index, isSymmetrical } = cell;

	return {
		id,
		displayNumber,
		correctValue,
		value: clearValues ? '' : value,
		x,
		y,
		index,
		isSymmetrical
	};
}

/**
 * transformCellMapForDb
 *
 * Remove fields from dynamic cellmap that we don't want in the DB
 */
export function transformCellMapForDb({ cellMap }: { cellMap: DynamicCellMap }): CellMap {
	const entries = Object.entries(cellMap); // [[0:0, {}], [1:1, {}], ]
	const newCellMap = Object.fromEntries(
		entries.map(([key, cell]) => {
			const newCell = transformCellForDb({ cell, clearValues: false });
			return [key, newCell];
		})
	);
	return newCellMap;
}

/**
 * transformPuzzleDataForDb
 *
 * Using the cellMap from the puzzle store, find all the words
 * and save them to either the acrossWords or downWords arrays.
 */
export function transformPuzzleDataForCreatingHints({
	cellMap: initialCellMap,
	clearValues = false
}: {
	cellMap: DynamicCellMap;
	clearValues?: boolean;
}): { cellMapForDb: CellMap; acrossHints: Array<Hint>; downHints: Array<Hint> } {
	let cellDisplayNumber = 1;
	const cellMap: CellMap = {};
	const cellsArray: CellsArray = Object.values(initialCellMap);
	const acrossHints = [];
	const downHints = [];
	// Nested loop with a time complexity of O(n^2)
	// I don't think this is a big problem since the loops won't be huge.
	// TODO: Monitor and possibly refactor to use a singly array rather than nested loops.
	for (let i = 0; i < cellsArray.length; i++) {
		let shouldIncrementCount = false;
		const initialCell: DynamicCell = cellsArray[i];

		// Get the transformed cell and work with it from here on.
		const cell: Cell = transformCellForDb({ cell: initialCell, clearValues });
		const id: ID = getId({ x: cell.x, y: cell.y });
		// Copy the transformed cell into the new cellmap
		cellMap[id] = cell;

		if (!cell.correctValue) {
			continue;
		}

		const { x, y } = cell;
		let word;

		// Find the across words
		const leftCellId: ID = getId({ x: x - 1, y });
		const rightCellId: ID = getId({ x: x + 1, y });

		if (!initialCellMap[leftCellId]?.correctValue && initialCellMap[rightCellId]?.correctValue) {
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
				value = initialCellMap[id]?.value;
			}
			// Get first/last cells in word to help with highlighting
			const startX = x;
			const endX = currentX;
			for (let i = startX; i < endX; i++) {
				//      cell.firstCellInAcrossWordXCoord = startX;
				//      cell.lastCellInAcrossWordXCoord = endX;
				//      cell.acrossWord = word;
			}
			const hint: Hint = {
				displayNumber: cellDisplayNumber,
				hint: '',
				answer: word
			};
			acrossHints.push(hint);
			shouldIncrementCount = true;
		}

		// Down Words!
		const aboveCellId: ID = getId({ x, y: y - 1 });
		const bottomCellId: ID = getId({ x, y: y + 1 });
		if (!initialCellMap[aboveCellId]?.correctValue && initialCellMap[bottomCellId]?.correctValue) {
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
				value = initialCellMap[id]?.value;
			}

			// Get first/last cells in word to help with highlighting
			const startY = y;
			const endY = currentY;

			for (let i = startY; i < endY; i++) {}
			const hint: Hint = {
				displayNumber: cellDisplayNumber,
				hint: '',
				answer: word
			};
			downHints.push(hint);
			shouldIncrementCount = true;
		}
		if (shouldIncrementCount) {
			cell.displayNumber = cellDisplayNumber;
			cellDisplayNumber++;
		}
	}

	return { cellMapForDb: cellMap, acrossHints, downHints };
}
