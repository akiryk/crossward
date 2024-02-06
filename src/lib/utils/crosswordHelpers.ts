import type { ID, Coords, Puzzle, Cell, GetNextCellProps } from '$utils/types';

// Find the cell that has rotational symmetry with the updated cell,
// e.g. the cell in the upper left corner has rotational symmetry with
// the cell in the lower right corner.
export const getSymmetricalCell = (puzzle: Puzzle, coords: Coords): Cell => {
	const { x: x1, y: y1 } = coords;
	const x2 = puzzle.acrossSpan - x1 - 1;
	const y2 = puzzle.downSpan - y1 - 1;
	const id: ID = `${x2}:${y2}`;
	const cell = puzzle.cellMap[id];
	return cell;
};

export const getIdFromCoords = (coords: Coords): ID => `${coords.x}:${coords.y}`;

// 1. Get input from an onInput event;
// 2. Trim it; make it uppercase
// 3. Remove the previous character so that only one character remains
export function getCleanValueOfInput({
	event,
	previousValue
}: {
	event: Event;
	previousValue: string;
}): string {
	const value = (event.target as HTMLSelectElement)?.value
		.trim()
		.toUpperCase()
		.replace(previousValue, '');
	if (value === '') {
		// This isn't actually being used right now so we could remove it.
		// If we want the spacebar to move cursor forward without deleting the
		// character, we'd use this
		return previousValue;
	}
	return value;
}

export function getCellAbove({ coords }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newY = y - 1;
	let newX = x; // row = y
	if (newY < 0) {
		return { x, y };
	}
	return { x: newX, y: newY };
}
export function getCellBelow({ coords, downSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newY = y + 1;
	let newX = x; // row = y
	if (newY >= downSpan) {
		return { x, y };
	}
	return { x: newX, y: newY };
}
export function getCellToTheLeft({ coords }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newX = x - 1; // column = x
	let newY = y; // row = y
	if (newX < 0) {
		return { x, y };
	}
	return { x: newX, y: newY };
}
export function getCellToTheRight({ coords, acrossSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newX = x + 1; // column = x
	let newY = y; // row = y
	if (newX >= acrossSpan) {
		return { x, y };
	}

	return { x: newX, y: newY };
}
