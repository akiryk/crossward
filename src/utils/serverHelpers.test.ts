import { it, describe, expect } from 'vitest';
import initialCellMap from '../__mocks__/mockInitialCellMap';
import cellMapForDb from '../__mocks__/mockCellMapForDb';
import { transformPuzzleDataForCreatingHints } from './serverHelpers';

describe('transformPuzzleDataForCreatingHints', () => {
	it('identifies hints and details for across words', () => {
		const { acrossHints } = transformPuzzleDataForCreatingHints({ initialCellMap });
		expect(acrossHints.length).toBe(3);
		expect(acrossHints[0]).toEqual({ displayNumber: 1, hint: '', answer: 'NEW' });
		expect(acrossHints[1]).toEqual({ displayNumber: 3, hint: '', answer: 'AG' });
		expect(acrossHints[2]).toEqual({ displayNumber: 4, hint: '', answer: 'EDEN' });
	});

	it('identifies hints and details for down words', () => {
		const { downHints } = transformPuzzleDataForCreatingHints({ initialCellMap });
		expect(downHints.length).toBe(2);
		expect(downHints[0]).toEqual({ displayNumber: 1, hint: '', answer: 'NAHE' });
		expect(downHints[1]).toEqual({ displayNumber: 2, hint: '', answer: 'WAGE' });
	});

	it('transforms the cellmap to include start/end locations of words', () => {
		const { cellMap } = transformPuzzleDataForCreatingHints({ initialCellMap });
		expect(cellMap).toEqual(cellMapForDb);
	});
});
