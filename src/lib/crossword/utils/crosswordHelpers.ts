import type { ID, Coords, Puzzle, DynamicCell, GetNextCellProps } from '$utils/types';

// Find the cell that has rotational symmetry with the updated cell,
// e.g. the cell in the upper left corner has rotational symmetry with
// the cell in the lower right corner.
export const getSymmetricalCell = (puzzle: Puzzle, coords: Coords): DynamicCell => {
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

export function getCellAbove({ coords, acrossSpan, downSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newY = y - 1;
	let newX = x; // row = y
	if (newY < 0) {
		newY = downSpan - 1;
		newX = x - 1 < 0 ? acrossSpan - 1 : x - 1;
	}
	return { x: newX, y: newY };
}
export function getCellBelow({ coords, acrossSpan, downSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newY = y + 1;
	let newX = x; // row = y
	if (newY >= downSpan) {
		newY = 0;
		newX = x + 1 >= acrossSpan ? 0 : x + 1;
	}
	return { x: newX, y: newY };
}
export function getCellToTheLeft({ coords, acrossSpan, downSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newX = x - 1; // column = x
	let newY = y; // row = y
	if (newX < 0) {
		newX = acrossSpan - 1;
		newY = y - 1 < 0 ? downSpan - 1 : y - 1;
	}
	return { x: newX, y: newY };
}
export function getCellToTheRight({ coords, acrossSpan, downSpan }: GetNextCellProps): Coords {
	const { x, y } = coords;
	let newX = x + 1; // column = x
	let newY = y; // row = y
	if (newX >= acrossSpan) {
		newX = 0;
		newY = y + 1 === downSpan ? 0 : y + 1;
	}
	// const nextCell = grid.cellMap[`${newX}:${newY}`];
	// while (shouldSkipNextCell(possibleNextCell, overrideDirectionMode)) {
	// 	return getCellToTheRight({
	// 		currentRow: newY,
	// 		currentColumn: newX
	// 	});
	// }
	return { x: newX, y: newY };
}

export function getId(x: number, y: number): ID {
	return `${x}:${y}`;
}
