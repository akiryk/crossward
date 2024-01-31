import {
	MINI,
	DAILY,
	SUNDAY,
	EDIT_PUZZLE,
	EDITING_HINTS,
	PUBLISHED,
	GAME_OVER
} from '$utils/constants';

export enum Direction {
	GO_DOWN,
	GO_UP,
	GO_RIGHT,
	GO_LEFT,
	GO_FORWARD
}

export enum GameStatus {
	EDITING_CELLS,
	EDITING_HINTS,
	PREVIEW,
	PLAY
}

export enum BannerType {
	IS_SUCCESS,
	IS_ERROR,
	IS_INFO
}

export enum ServerErrorType {
	PUBLISH_INCOMPLETE_HINTS,
	DB_ERROR,
	MISSING_FORM_DATA,
	UPDATE_TITLE_DB_ERROR
}

export type CellsArray = Array<Cell>;
export type DynamicCellsArray = Array<DynamicCell>;
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
	isSymmetrical: boolean;
	index: number;
	// These are conveniences so we can highlight the word's cells and not others
	acrossWordStartX?: number;
	acrossWordEndX?: number;
	downWordStartY?: number;
	downWordEndY?: number;
};

export interface DynamicCell extends Cell {
	hasFocus: boolean;
}

export type CellMap = Record<ID, Cell>;
export type DynamicCellMap = Record<ID, DynamicCell>;

export type PuzzleSizes = {
	[MINI]: number;
	[DAILY]: number;
	[SUNDAY]: number;
};
export type PuzzleType = typeof MINI | typeof DAILY | typeof SUNDAY;
export type PublishStatus =
	| typeof EDIT_PUZZLE
	| typeof EDITING_HINTS
	| typeof PUBLISHED
	| typeof GAME_OVER;

export type Hint = {
	displayNumber: number;
	hint: string;
	answer: string;
};

export type HintDirection = 'across' | 'down';

// PuzzleDocument is the type for new puzzles before being saved
export type PuzzleDocument = {
	title: string;
	authorEmail: string;
	dateCreated: string;
	publishStatus: PublishStatus;
	puzzleType: PuzzleType;
	cellMap: CellMap;
	acrossSpan: number;
	downSpan: number;
	acrossHints: Array<Hint>;
	downHints: Array<Hint>;
	incorrectCells?: Array<ID>;
};

export interface PuzzleFromDb extends PuzzleDocument {
	_id: () => string;
}

export interface PuzzleWithId extends PuzzleDocument {
	_id: string;
}

export interface Puzzle extends PuzzleDocument {
	_id: string;
	cellMap: DynamicCellMap;
	cellRows: Array<DynamicCellsArray>;
	cellWithFocus: DynamicCell | null;
	gridDirection: Direction;
	highlightedCellIds: Array<ID>;
	userId?: string;
	gameId?: string;
	incorrectCells?: Array<ID>;
}

export interface PlayerPuzzle extends PuzzleDocument {
	userGameId?: string;
	_id?: () => string;
}

export type Puzzles = Array<Puzzle>;

export type SanitizeInputParams = {
	data: FormData;
	inputName: string;
	fallback?: string;
};

export type Coords = { x: number; y: number };

export type GetNextCellProps = {
	coords: Coords;
	acrossSpan: number;
	downSpan: number;
};

export type DynamicCellMapArray = Array<[string, DynamicCell]>;
export type CellMapArray = Array<[string, Cell]>;
