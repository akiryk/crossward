import Cell, { type DynamicCellMap } from './DynamicCell';
import { type ID, type Grid, type Coords, Direction, type Hint, type CellMap } from '$utils/types';

export interface DynamicGridProperties {
	acrossSpan: number;
	downSpan: number;
	cellMap: CellMap;
	acrossHints: Array<Hint | undefined>;
	downHints: Array<Hint | undefined>;
}

export default class DynamicGrid {
	acrossSpan: number;
	downSpan: number;
	cellsArray: Array<Cell>;
	cellMap: DynamicCellMap;
	startCellsWordsAcross: Array<string>;
	startCellsWordsDown: Array<string>;
	cellWithFocus: Cell | null;
	gridDirection: Direction;
	highlightedCells: Array<Cell>;
	currentRow: number;
	currentColumn: number;
	cellRows: Array<Array<Cell>>;
	highlightedPlayCells: Array<Cell>;
	workingAnswersKey: Record<ID, string>;
	// answerKey = {};
	constructor(grid: DynamicGridProperties) {
		this.acrossSpan = grid.acrossSpan;
		this.downSpan = grid.downSpan;
		this.cellsArray = [];
		this.cellMap = {};
		this.startCellsWordsAcross = [];
		this.startCellsWordsDown = [];
		this.cellWithFocus = null;
		this.gridDirection = Direction.GO_LEFT_TO_RIGHT;
		this.highlightedCells = [];
		this.currentRow = -1;
		this.currentColumn = -1;
		this.cellRows = [];
		this.highlightedPlayCells = [];
		// this.answerKey = {};
		this.workingAnswersKey = {};

		const savedCellMap = grid.cellMap;
		for (let y = 0; y < this.acrossSpan; y++) {
			const row = [];
			for (let x = 0; x < this.downSpan; x++) {
				const cell = new Cell({ x, y });
				// update the cell with data saved from existing cellMap
				cell.displayNumber = savedCellMap[`${x}:${y}`].displayNumber;
				cell.correctValue = savedCellMap[`${x}:${y}`].correctValue;
				cell.value = savedCellMap[`${x}:${y}`].value;
				this.cellsArray.push(cell);
				row.push(cell);
				this.cellMap[`${cell.id as ID}`] = cell;
			}
			this.cellRows.push(row);
		}
	}

	populate(data: Grid) {
		if (!data.cellMap) {
			return;
		}

		// reset all the cells
		this.cellsArray = [];
		this.cellMap = {};
		this.cellRows = [];

		// this.answerKey = data.answerKey;
		let cells;
		for (let y = 0; y < this.acrossSpan; y++) {
			cells = [];
			for (let x = 0; x < this.downSpan; x++) {
				const cell = new Cell({
					x,
					y
				});
				const id = cell.id as ID;
				cell.correctValue = data.cellMap[`${id}`]?.correctValue;
				cell.value = data.cellMap[`${id}`]?.value;
				cell.cellHasFocus = false;
				cell.displayNumber = data.cellMap[`${id}`]?.displayNumber;
				this.cellsArray.push(cell);
				cells.push(cell);
				this.cellMap[`${id}`] = cell;
			}
			this.cellRows.push(cells);
		}
	}

	updateWorkingAnswers(cell: Cell) {
		this.workingAnswersKey[cell.id as ID] = cell.value;
	}

	ensureRotationalSymmetry({ x: x1, y: y1 }: Coords) {
		const x2 = this.acrossSpan - x1 - 1;
		const y2 = this.downSpan - y1 - 1;
		const value1 = this.cellMap[`${x1}:${y1}`].value;
		const value2 = this.cellMap[`${x2}:${y2}`].value;
		this.cellMap[`${x1}:${y1}`].toggleIsSymmetrical(!!value1 || !!value2);
		this.cellMap[`${x2}:${y2}`].toggleIsSymmetrical(!!value1 || !!value2);
	}

	clearHighlightedCells() {
		this.highlightedCells = [];
	}

	setCellWithFocus(id: ID) {
		if (this.cellWithFocus) {
			this.cellWithFocus.disableFocus();
		}
		this.cellWithFocus = this.cellMap[id];
		this.cellWithFocus.enableFocus();
	}

	toggleGridDirection() {
		this.gridDirection =
			this.gridDirection === Direction.GO_LEFT_TO_RIGHT
				? Direction.GO_TOP_TO_BOTTOM
				: Direction.GO_LEFT_TO_RIGHT;
		this.currentColumn = -1;
		this.currentRow = -1;
	}
}

export const getDynamicGrid = (grid: Grid) => {
	return new DynamicGrid(grid);
};
