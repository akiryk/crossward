import { it, describe, expect } from 'vitest';
import initialCellMap from '../__mocks__/initialCellMap';
import mockCellMapForDb from '../__mocks__/cellMapForDb';
import mockClearedValuesCellMapForDb from '../__mocks__/clearedValuesCellMapForDb';
import { transformPuzzleDataForCreatingHints } from './serverHelpers';

describe('transformPuzzleDataForCreatingHints', () => {
	it('identifies hints and details for across words', () => {
		const { acrossHints } = transformPuzzleDataForCreatingHints({ cellMap: initialCellMap });
		expect(acrossHints.length).toBe(2);
		expect(acrossHints[0]).toEqual({ displayNumber: 1, hint: '', answer: 'QUINT' });
		expect(acrossHints[1]).toEqual({ displayNumber: 3, hint: '', answer: 'POT' });
	});

	it('identifies hints and details for down words', () => {
		const { downHints } = transformPuzzleDataForCreatingHints({ cellMap: initialCellMap });
		expect(downHints.length).toBe(3);
		expect(downHints[0]).toEqual({ displayNumber: 1, hint: '', answer: 'QUILL' });
		expect(downHints[1]).toEqual({ displayNumber: 2, hint: '', answer: 'TAT' });
		expect(downHints[2]).toEqual({ displayNumber: 3, hint: '', answer: 'PIN' });
	});

	it('transforms the cellmap to include start/end locations of words', () => {
		const { cellMapForDb } = transformPuzzleDataForCreatingHints({ cellMap: initialCellMap });
		expect(cellMapForDb).toEqual(mockCellMapForDb);
	});

	it('clears the cell values when passed clearValues prop', () => {
		const { cellMapForDb } = transformPuzzleDataForCreatingHints({
			cellMap: initialCellMap,
			clearValues: true
		});
		expect(cellMapForDb).toEqual(mockClearedValuesCellMapForDb);
	});
});
