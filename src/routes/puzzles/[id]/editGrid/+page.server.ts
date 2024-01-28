// [id]/editPuzzle/page.server.ts
import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	pageServerLoad,
	handleUpdateTitle,
	handleDelete,
	transformPuzzleDataForCreatingHints,
	transformCellMapArrayForDb
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { EDITING_HINTS } from '$utils/constants';
import { ServerErrorType } from '$utils/types';
import type { CellMap, Hint, CellMapArray } from '$utils/types';

export const load = pageServerLoad;

export const actions = {
	createHints: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const cellMapString = data.get('cellMap');

		const id = data.get('id');
		if (!id || typeof id !== 'string' || !cellMapString || typeof cellMapString !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
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
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR
			});
		}
	},
	updateCellMap: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const newCellMapChunk = data.get('chunk');
		const id = data.get('id');
		if (!id || typeof id !== 'string' || !newCellMapChunk || typeof newCellMapChunk !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
		}

		const cellMapArrayForDb: CellMapArray = transformCellMapArrayForDb({
			cellMapArray: JSON.parse(newCellMapChunk)
		});

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = { $set: {} };

		for (const [key, value] of cellMapArrayForDb) {
			// @ts-expect-error this looks weird but is MongoDb syntax
			// In Javascript, you might instead say set.cellMap["0:0"], but that doesn't work in Mongo
			updateDocument.$set[`cellMap.${key}`] = value;
		}

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200 // HTTP status for "See Other"
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR
			});
		}
	},
	updateTitle: handleUpdateTitle,
	delete: handleDelete
};
