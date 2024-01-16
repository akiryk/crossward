import type { CellMap, Cell, ID } from './types';

export const createInitialCellMap = (acrossSpan: number, downSpan: number): CellMap => {
	const map: CellMap = {};
	for (let y = 0; y < downSpan; y++) {
		for (let x = 0; x < acrossSpan; x++) {
			const id: ID = `${x}:${y}`;
			const cell: Cell = {
				id,
				displayNumber: 0,
				correctValue: '',
				value: '',
				x,
				y
			};
			map[id] = cell;
		}
	}
	return map;
};
