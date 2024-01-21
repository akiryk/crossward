import { MINI, DAILY, SUNDAY } from '$utils/constants';
import { DRAFT, PUBLISHED } from '$utils/constants';
export enum Direction {
	GO_TOP_TO_BOTTOM,
	GO_BOTTOM_TO_TOP,
	GO_LEFT_TO_RIGHT,
	GO_RIGHT_TO_LEFT
}

export type CellsArray = Array<DynamicCell>;
export type ID = `${number}:${number}`;

// We have two types of Grid and Cell
// Grid and Cell are the types for data we save to the database
// DynamicGrid and DynamicCell are types for data we use in JS on the client
export type Cell = {
	x: number;
	y: number;
	id: ID;
	displayNumber: number;
	correctValue: string;
	value: string;
};

export interface DynamicCell extends Cell {
	cellHasFocus: boolean;
	isSymmetrical: boolean;
	index: number;
}

export type CellMap = Record<ID, Cell>;
export type DynamicCellMap = Record<ID, DynamicCell>;

export type GridSizes = {
	[MINI]: number;
	[DAILY]: number;
	[SUNDAY]: number;
};
export type PuzzleType = typeof MINI | typeof DAILY | typeof SUNDAY;
export type PublishStatus = typeof DRAFT | typeof PUBLISHED;

export type Hint = {
	displayNumber: string;
	hint: string;
	answer: string;
};

export type Grid = {
	acrossSpan: number;
	downSpan: number;
	cellMap: CellMap;
	acrossHints: Array<Hint | undefined>;
	downHints: Array<Hint | undefined>;
};

export interface DynamicGrid extends Grid {
	cellMap: DynamicCellMap;
	cellRows: Array<CellsArray>;
	cellsArray: CellsArray;
	cellWithFocus: DynamicCell | null;
	gridDirection: Direction;
	currentRow: number;
	currentColumn: number;
	workingAnswersKey: Record<string, string>;
}

// PuzzleDocument is the type for new puzzles before being saved
export type PuzzleDocument = {
	title: string;
	authorEmail: string;
	dateCreated: string;
	publishStatus: PublishStatus;
	puzzleType: PuzzleType;
	grid: Grid;
};

export interface PuzzleFromDb extends PuzzleDocument {
	_id: () => string;
}

export interface PuzzleWithId extends PuzzleDocument {
	_id: string;
}

export interface Puzzle extends PuzzleDocument {
	_id: string;
	grid: DynamicGrid;
}

export type Puzzles = Array<Puzzle>;

export type SanitizeInputParams = {
	data: FormData;
	inputName: string;
	fallback?: string;
};

export type Coords = { x: number; y: number };
