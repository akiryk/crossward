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

export const GO_TOP_TO_BOTTOM = 'GO_TOP_TO_BOTTOM';
export const GO_BOTTOM_TO_TOP = 'GO_BOTTOM_TO_TOP';
export const GO_LEFT_TO_RIGHT = 'GO_LEFT_TO_RIGHT';
export const GO_RIGHT_TO_LEFT = 'GO_RIGHT_TO_LEFT';
export const DIRECTION_MODES = [
	GO_TOP_TO_BOTTOM,
	GO_BOTTOM_TO_TOP,
	GO_LEFT_TO_RIGHT,
	GO_RIGHT_TO_LEFT
];

// Cell Modes
export const EDIT_MODE = 'EDIT_MODE';
export const PLAY_MODE = 'PLAY_MODE';
export const VIEW_ONLY_MODE = 'VIEW_ONLY_MODE';
export const DEAD_CELL_MODE = 'DEAD_CELL_MODE';
