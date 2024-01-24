import type {
	CellMap,
	DynamicCellMap,
	Cell,
	ID,
	Puzzle,
	DynamicCell,
	PuzzleWithId,
	CellsArray
} from './types';
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

export function cleanCellMapForDb({
	cellMap,
	clearValues = false
}: {
	cellMap: DynamicCellMap;
	clearValues?: boolean;
}): CellMap {
	const entries = Object.entries(cellMap); // [[0:0, {}], [1:1, {}], ]
	const newCellMap = Object.fromEntries(
		entries.map(([key, cell]) => {
			// destructure dynamic cell to get only the fields we want
			const { id, displayNumber, correctValue, value, x, y, index, isSymmetrical } = cell;
			// reset value to '' because the grid is now fixed; only correctValues or player-entered ones matter
			return [
				key,
				{
					id,
					displayNumber,
					correctValue,
					value: clearValues ? '' : value,
					x,
					y,
					index,
					isSymmetrical
				}
			];
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
			const id: ID = `${x}:${y}`;
			const cell = cellMap[id];
			const dynamicCell: DynamicCell = {
				...cell,
				hasFocus: false
			};
			dynamicCellMap[id] = dynamicCell;
			row.push(dynamicCell);
			cellsArray.push(dynamicCell);
		}
		cellRows.push(row);
	}
	return { cellRows, cellsArray, dynamicCellMap };
}

export function createDisplayNumbers(cellMap: DynamicCellMap, cellsArray: CellsArray) {
	// use cellsArray to create all the displayNumbers, hints, and words
	// - acrossWord
	// - firstCellInAcrossWordXCoord
	// - lastCellInAcrossWordXCoord
	// - downWord
	// - firstCellInDownWordXCoord
	// - lastCellInDownWordXCoord
	// - displayNumber

	let cellDisplayNumber = 1;

	for (let i = 0; i < cellsArray.length; i++) {
		let shouldIncrementCount = false;
		const cell: DynamicCell = cellsArray[i];
		if (!cell.value) {
			continue;
		}
		// console.log(`cell.value: ${cell.value}`);

		const x: number = cell.x;
		const y: number = cell.y;
		let word;

		// Across Words!
		const leftCellId: ID = `${x - 1}:${y}`;
		const rightCellId: ID = `${x + 1}:${y}`;
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
				value = cellMap[`${currentX}:${y}`]?.value;
			}

			// Get first/last cells in word to help with highlighting
			const startX = cell.x;
			const endX = currentX;
			console.log('startX', startX);
			console.log('endX', endX);
			for (let x = startX; x < endX; x++) {
				//      cell.firstCellInAcrossWordXCoord = startX;
				//      cell.lastCellInAcrossWordXCoord = endX;
				//      cell.acrossWord = word;
			}
			shouldIncrementCount = true;
		}

		// Down Words!
		const aboveCellId: ID = `${x}:${y - 1}`;
		const bottomCellId: ID = `${x}:${y + 1}`;
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
				value = cellMap[`${x}:${currentY}`]?.value;
			}

			// Get first/last cells in word to help with highlighting
			const startY = cell.y;
			const endY = currentY;

			for (let y = startY; y < endY; y++) {}
			shouldIncrementCount = true;
		}

		if (shouldIncrementCount) {
			cell.displayNumber = cellDisplayNumber;
			cellDisplayNumber++;
		}
	}
}
