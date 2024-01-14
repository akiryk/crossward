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
export type UnserializablePuzzle = {
	_id: () => string;
	title: string;
	downSpan: number;
	crossSpan: number;
	cellsMap: Record<ID, Cell>;
};
export type Puzzle = {
	_id: string;
	title: string;
	downSpan: number;
	crossSpan: number;
	cellsMap: Record<ID, Cell>;
};
export type Puzzles = Array<Puzzle>;
export type GridSizes = {
	[MINI]: number;
	[DAILY]: number;
	[SUNDAY]: number;
};
export type GridSizeName = typeof MINI | typeof DAILY | typeof SUNDAY;
export type PublishStatus = typeof DRAFT | typeof PUBLISHED;
