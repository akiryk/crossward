// [id]/editPuzzle/page.server.ts
import { ObjectId } from 'mongodb';
import { puzzlesCollection } from '$db/puzzles';
import {
	pageServerLoad,
	handleUpdateTitle,
	handleDelete,
	transformCellMapForDb,
	transformPuzzleDataForCreatingHints
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { EDITING_HINTS } from '$utils/constants';
import type { CellMap, DynamicCellMap, Hint } from '$utils/types';

export const load = pageServerLoad;

export const actions = {
	createHints: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const cellMapString = data.get('cellMap');

		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			// log error
			return;
		}
		if (!cellMapString || typeof cellMapString !== 'string') {
			// TODO: log error
			return;
		}

		const cellMap = JSON.parse(cellMapString);

		const {
			cellMapForDb,
			acrossHints,
			downHints
		}: {
			cellMapForDb: CellMap;
			acrossHints: Array<Hint>;
			downHints: Array<Hint>;
		} = transformPuzzleDataForCreatingHints({
			cellMap,
			clearValues: true
		});

		const filter = {
			_id: new ObjectId(id)
		};

		const updateDocument = {
			$set: {
				cellMap: cellMapForDb,
				publishStatus: EDITING_HINTS,
				downHints,
				acrossHints
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			// throw redirect(303, `/puzzles/${id}/create`);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}/editHints`
				}
			};
		} catch {
			//
		}
	},
	updateCellMap: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const cellMap = data.get('cellMap');

		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			// log error
			return;
		}
		if (!cellMap || typeof cellMap !== 'string') {
			// TODO: log error
			return;
		}

		const parsedCellMap: DynamicCellMap = JSON.parse(cellMap);
		const cellMapForDb: CellMap = transformCellMapForDb({
			cellMap: parsedCellMap
		});

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = {
			$set: {
				cellMap: cellMapForDb
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}/editGrid`
				}
			};
		} catch {
			//ol,.
		}
	},
	updateTitle: handleUpdateTitle,
	delete: handleDelete
};
