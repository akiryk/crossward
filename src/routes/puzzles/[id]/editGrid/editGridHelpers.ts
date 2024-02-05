import { get } from 'svelte/store';
import type { ID, GameContext, CellMap } from '$utils/types';
import GameStore from '../../../../stores/GameStore';
import { getId } from '$utils/helpers';

// Add all words that are less than 3 characters to GameStore's list of ids to be
// highlighted in preview mode.
export function findWordsThatAreTooShort(cellMap: CellMap) {
	const activeCellIds = get(GameStore).activeCellIds;
	const twoLetterWordIds: Array<ID> = [];

	for (let i = 0; i < activeCellIds.length; i++) {
		const cell = cellMap[activeCellIds[i]];
		if (!cell.correctValue) continue;

		const { x, y, id: cellId } = cell;

		// Find the down words
		const aboveCellId: ID = getId({ x, y: y - 1 });
		const secondDownCell: ID = getId({ x, y: y + 1 });
		const thirdDownCell: ID = getId({ x, y: y + 2 });
		// Find the across cells
		const leftCellId: ID = getId({ x: x - 1, y });
		const secondRightCell: ID = getId({ x: x + 1, y });
		const thirdRightCell: ID = getId({ x: x + 2, y });

		// This is a 2-letter word if:
		// - the above-side cell is empty,
		// - the down-side cell has content
		// - the cell below that is empty
		if (
			!cellMap[aboveCellId]?.correctValue &&
			cellMap[secondDownCell]?.correctValue &&
			!cellMap[thirdDownCell]?.correctValue
		) {
			if (!twoLetterWordIds.includes(cellId)) {
				twoLetterWordIds.push(cellId);
			}
			if (!twoLetterWordIds.includes(secondDownCell)) {
				twoLetterWordIds.push(secondDownCell);
			}
		}

		// This is a 2-letter word if:
		// - the left-side cell is empty,
		// - the across-side cell has content
		// - the cell below that is empty
		if (
			!cellMap[leftCellId]?.correctValue &&
			cellMap[secondRightCell]?.correctValue &&
			!cellMap[thirdRightCell]?.correctValue
		) {
			if (!twoLetterWordIds.includes(cellId)) {
				twoLetterWordIds.push(cellId);
			}
			if (!twoLetterWordIds.includes(secondRightCell)) {
				twoLetterWordIds.push(secondRightCell);
			}
		}
	}

	GameStore.update((current: GameContext) => {
		return {
			...current,
			twoLetterWordIds
		};
	});
}
