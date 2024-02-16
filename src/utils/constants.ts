export const MINI_GRID_SIZE = 5;
export const DAILY_GRID_SIZE = 15;
export const SUNDAY_GRID_SIZE = 30;
export const MINI = 'mini';
export const DAILY = 'daily';
export const SUNDAY = 'sunday';

export const GRID_SIZES = {
	[MINI]: MINI_GRID_SIZE,
	[DAILY]: DAILY_GRID_SIZE,
	[SUNDAY]: SUNDAY_GRID_SIZE
};

export const DRAFT = 'draft';
export const PUBLISHED = 'published';
export const EDIT_PUZZLE = 'editPuzzle';
export const EDITING_HINTS = 'editHints';
export const GAME_OVER = 'gameOver';

// Cell Modes
export const EDIT_MODE = 'EDIT_MODE';
export const PLAY_MODE = 'PLAY_MODE';
export const VIEW_ONLY_MODE = 'VIEW_ONLY_MODE';
export const DEAD_CELL_MODE = 'DEAD_CELL_MODE';

export const DEBOUNCE_DEFAULT_DELAY = 300;
export const DEFAULT_CHUNK_SIZE = 25;

export const INCOMPLETE = 'INCOMPLETE';
export const COMPLETE_AND_NO_ERRORS = 'COMPLETE_AND_NO_ERRORS';
export const COMPLETE_BUT_WITH_ERRORS = 'COMPLETE_BUT_WITH_ERRORS';

// Error and Success types for form submission
export const UPDATE_TITLE = 'updateTitle';
export const DELETE_PUZZLE = 'deletePuzzle';

export const MISSING_SYMMETRY = 'MISSING_SYMMETRY';
export const TWO_LETTER_WORDS = 'TWO_LETTER_WORDS';
export const PUZZLE_INCOMPLETE = 'PUZZLE_INCOMPLETE';
export const REVERT_TO_GRID = 'REVERT_TO_GRID';
export const PUBLISH_PUZZLE = 'PUBLISH_PUZZLE';
export const MISSING_HINTS = 'MISSING_HINTS';
