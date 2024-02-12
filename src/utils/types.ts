import {
	MINI,
	DAILY,
	SUNDAY,
	EDIT_PUZZLE,
	EDITING_HINTS,
	PUBLISHED,
	INCOMPLETE,
	COMPLETE_BUT_WITH_ERRORS,
	COMPLETE_AND_NO_ERRORS
} from '$utils/constants';

export enum Direction {
	GO_DOWN,
	GO_UP,
	GO_RIGHT,
	GO_LEFT,
	GO_FORWARD
}

export enum UserMode {
	EDITING_CELLS,
	EDITING_HINTS,
	PREVIEW,
	PLAY,
	GAME_OVER
}

// Only applies if PublishStatus is PUBLISHED
export type PlayMode =
	| typeof INCOMPLETE
	| typeof COMPLETE_BUT_WITH_ERRORS
	| typeof COMPLETE_AND_NO_ERRORS;

export enum BannerType {
	IS_SUCCESS,
	IS_ERROR,
	IS_INFO
}

export type PublishStatus = typeof EDIT_PUZZLE | typeof EDITING_HINTS | typeof PUBLISHED;

export enum ServerErrorType {
	PUBLISH_INCOMPLETE_HINTS,
	DB_ERROR,
	MISSING_FORM_DATA,
	UPDATE_TITLE_DB_ERROR
}

export enum FirstCellInWord {
	ACROSS,
	DOWN,
	BOTH,
	NEITHER
}

export type PuzzleSizes = {
	[MINI]: number;
	[DAILY]: number;
	[SUNDAY]: number;
};
export type PuzzleType = typeof MINI | typeof DAILY | typeof SUNDAY;

export type HintDirection = 'across' | 'down';

// PuzzleTemplate is the type for new puzzles before being saved
export type PuzzleTemplate = {
	_id: string;
	acrossHints: Array<Hint>;
	acrossSpan: number;
	authorEmail: string;
	cellMap: CellMap;
	cellRows: Array<CellsArray>;
	dateCreated: string;
	downHints: Array<Hint>;
	downSpan: number;
	publishStatus: PublishStatus;
	puzzleType: PuzzleType;
	title: string;
};

export interface EditorPuzzle extends PuzzleTemplate {}

export interface PlayerPuzzle extends PuzzleTemplate {
	incorrectCells: Array<ID>;
	playMode: PlayMode;
	userGameId: string;
}

export type Puzzle = EditorPuzzle | PlayerPuzzle;
export type Puzzles = Array<EditorPuzzle | PlayerPuzzle>;

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

export type CellsArray = Array<Cell>;
export type CellRows = Array<CellsArray>;
export type CellMapArray = Array<CellIdTuple>;
export type CellIdTuple = [id: ID | string, cell: Cell];

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
	hasFocus?: boolean;
	// These are conveniences so we can highlight the word's cells and not others
	acrossWordStartX?: number;
	acrossWordEndX?: number;
	downWordStartY?: number;
	downWordEndY?: number;
	isPlayerCell?: boolean;
	firstCellInWordType?: FirstCellInWord;
};

export type CellMap = Record<ID, Cell>;
export type ID = `${number}:${number}`;

export type Hint = {
	displayNumber: number;
	hint: string;
	answer: string;
};

export type GameContext = {
	gridDirection: Direction;
	highlightedCellIds: Array<ID>;
	twoLetterWordIds: Array<ID>;
	cellWithFocusId: ID | null;
	activeCellIds: Array<ID>;
};
