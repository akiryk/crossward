import { type WithId } from 'mongodb';
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

export type HintDirection = 'across' | 'down';

// PuzzleTemplate is the type for new puzzles before being saved
export type PuzzleTemplate = {
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

export interface PuzzleFromDb extends PuzzleTemplate {
	_id: () => string;
}

export interface PuzzleWithId extends PuzzleTemplate {
	_id: string;
}

export interface Puzzle extends PuzzleTemplate {
	_id: string;
	cellMap: CellMap;
	cellRows: Array<CellsArray>;
}

interface PlayerPuzzle extends WithId<Document> {
	userGameId?: string;
	_id?: () => string;
}

// cellWithFocus: Cell | null;
// 	gridDirection: Direction;
// 	highlightedCellIds: Array<ID>;
export interface PlayerPuzzle extends PuzzleTemplate {}

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

export type IdCellTuple = [id: ID, cell: DynamicCell];

export type Hint = {
	displayNumber: number;
	hint: string;
	answer: string;
};
