import { it, describe, expect } from 'vitest';
import { getActiveCellIdsFromCellMap, findWordsThatAreTooShort } from './editGridHelpers';
import mockCellMapForFindWordsThatAreTooShort from '../../../../__mocks__/mockCellMapForFindWordsThatAreTooShort';
import type { CellMap } from '$utils/types';

// activeCellIds are the IDs of cells that have a value; they are not going to be black cells
const mockActiveCellIds = [
	'0:0',
	'1:0',
	'2:0',
	'2:1',
	'0:2',
	'1:2',
	'2:2',
	'3:2',
	'2:3',
	'3:3',
	'1:4',
	'2:4'
];

describe('findWordsThatAreTooShort', () => {
	it('returns an array of cell IDs that are two-letters long', () => {
		const cellMap = mockCellMapForFindWordsThatAreTooShort;
		// @ts-ignore
		expect(findWordsThatAreTooShort(cellMap, mockActiveCellIds)).toEqual([
			'3:2',
			'3:3',
			'2:3',
			'1:4',
			'2:4'
		]);
	});
});

describe('getActiveCellIdsFromCellMap', () => {
	it('correctly returns only IDs for cells that have a value', () => {
		// mockCellMap only has the fields necessary for this helper function
		const mockCellMap: CellMap = {
			// @ts-ignore
			'0:0': {
				id: '0:0',
				correctValue: 'A'
			},
			// @ts-ignore
			'0:1': {
				id: '0:1',
				correctValue: 'B'
			},
			// @ts-ignore
			'0:2': {
				id: '0:2',
				correctValue: ''
			},
			// @ts-ignore
			'0:3': {
				id: '0:2',
				correctValue: ''
			}
		};
		expect(getActiveCellIdsFromCellMap(mockCellMap)).toEqual(['0:0', '0:1']);
	});
});
