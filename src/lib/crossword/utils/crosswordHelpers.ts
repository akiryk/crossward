import type { ID, Coords, DynamicGrid, DynamicCell, CellsArray } from '$utils/types';

export const getSymmetricalCell = (grid: DynamicGrid, coords: Coords): DynamicCell => {
	const { x: x1, y: y1 } = coords;
	const x2 = grid.acrossSpan - x1 - 1;
	const y2 = grid.downSpan - y1 - 1;
	const id: ID = `${x2}:${y2}`;
	const cell = grid.cellMap[id];
	// const symmetricalCellIndex = x1 * x2 - 1;
	return cell;
};

export const getIdFromCoords = (coords: Coords): ID => `${coords.x}:${coords.y}`;
