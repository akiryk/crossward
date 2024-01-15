import { MINI, DAILY, SUNDAY } from '$utils/constants';
import { DRAFT, PUBLISHED } from '$utils/constants';

export type Row = Array<Cell | null>;
export type Rows = Array<Row>;
export type ID = `${number}:${number}`;
export type Cell = {
	correctValue: string;
	displayNumber: number;
	id: string;
	value: string;
	x: number;
	y: number;
};
export type GridSizes = {
	[MINI]: number;
	[DAILY]: number;
	[SUNDAY]: number;
};
export type GridSizeName = typeof MINI | typeof DAILY | typeof SUNDAY;
export type PublishStatus = typeof DRAFT | typeof PUBLISHED;

export type CellMap = Record<ID, Cell>;
export type Hint = {
	displayNumber: string;
	hint: string;
	answer: string;
};

// PuzzleDocument is the type for new puzzles before being saved
export type PuzzleDocument = {
	title: string;
	authorEmail: string;
	dateCreated: string;
	publishStatus: string;
	puzzleType: string;
	grid: {
		acrossSpan: number;
		downSpan: number;
		cellMap: CellMap | null;
		acrossHints: Array<Hint | undefined>;
		downHints: Array<Hint | undefined>;
	};
};

export interface PuzzleFromDb extends PuzzleDocument {
	_id: () => string;
}

export interface Puzzle extends PuzzleDocument {
	_id: string;
}

export type Puzzles = Array<Puzzle>;

export type SanitizeInputParams = {
	data: FormData;
	inputName: string;
	fallback?: string;
};
