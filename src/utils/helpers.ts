import type { CellMap, DynamicCellMap, Cell, ID, Puzzle, DynamicCell, PuzzleWithId } from './types';
import { Direction } from './types';
import sanitizeHtml from 'sanitize-html';
import type { SanitizeInputParams } from './types';

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
			const cell: Cell = {
				id,
				displayNumber: 0,
				correctValue: '',
				value: '',
				x,
				y
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
	const { cellRows, cellsArray, dynamicCellMap } = createCellArrays(puzzle);

	const dynamicPuzzle = {
		...puzzle,
		cellMap: dynamicCellMap,
		cellRows,
		cellsArray,
		cellWithFocus,
		gridDirection,
		currentRow,
		currentColumn,
		workingAnswersKey,
		highlightedCellIds
	};

	return dynamicPuzzle;
};

export function cleanCellMapForDb(cellMap: DynamicCellMap): CellMap {
	const entries = Object.entries(cellMap); // [[0:0, {}], [1:1, {}], ]
	console.log(Array.isArray(entries));
	const newCellMap = Object.fromEntries(
		entries.map(([key, cell]) => {
			// destructure dynamic cell to get only the fields we want
			const { id, displayNumber, correctValue, value, x, y, index } = cell;
			return [key, { id, displayNumber, correctValue, value, x, y, index }];
		})
	);
	return newCellMap;
}

function createCellArrays(puzzle: PuzzleWithId) {
	const { acrossSpan, downSpan, cellMap } = puzzle;
	const cellsArray = [];
	const cellRows = [];
	const dynamicCellMap: DynamicCellMap = {};
	for (let y = 0; y < downSpan; y++) {
		const row = [];
		for (let x = 0; x < acrossSpan; x++) {
			const index = y * downSpan + x;
			const id: ID = `${x}:${y}`;
			const cell = cellMap[id];
			const dynamicCell: DynamicCell = {
				...cell,
				hasFocus: false,
				isSymmetrical: false,
				index
			};
			dynamicCellMap[id] = dynamicCell;
			row.push(dynamicCell);
			cellsArray.push(dynamicCell);
		}
		cellRows.push(row);
	}
	return { cellRows, cellsArray, dynamicCellMap };
}
