import type { ID, Coords, DynamicGrid, CellMap } from '$utils/types';

export const ensureRotationalSymmetry = (grid: DynamicGrid, coords: Coords) => {
	const { x: x1, y: y1 } = coords;
	const x2 = grid.acrossSpan - x1 - 1;
	const y2 = grid.downSpan - y1 - 1;
	const value1 = grid.cellMap[`${x1}:${y1}`].value;
	const value2 = grid.cellMap[`${x2}:${y2}`].value;
	grid.cellMap[`${x1}:${y1}`].isSymmetrical = !!value1 || !!value2 ? false : true;
	grid.cellMap[`${x2}:${y2}`].isSymmetrical = !!value1 || !!value2 ? false : true;
};
