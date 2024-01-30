// [id]/editPuzzle/page.server.ts
import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	pageServerLoad,
	handleUpdateTitle,
	handleDelete,
	transformPuzzleDataForCreatingHints,
	transformCellMapArrayForDb
} from '$utils/serverHelpers';
import type { RequestEvent, PageServerLoad } from './$types';
import { EDITING_HINTS } from '$utils/constants';
import type { CellMap, PuzzleWithId, CellMapArray } from '$utils/types';
import { ServerErrorType } from '$utils/types';

export const load = pageServerLoad;

export const actions = {
	createHints: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
		}
		// 1. Retrieve the completed cellMap
		let puzzleCellMapData;
		try {
			puzzleCellMapData = await puzzlesCollection.findOne(
				{
					_id: new ObjectId(id)
				},
				{ projection: { cellMap: 1 } }
			);

			if (puzzleCellMapData === null || puzzleCellMapData.cellMap === null) {
				// TODO: Redirect to some kind of help page
				throw redirect(300, '/');
			}
		} catch (error) {
			return fail(422, {
				error
			});
		}

		// 2. Use the cellMap to create the hints
		const { cellMap, acrossHints, downHints } = transformPuzzleDataForCreatingHints({
			initialCellMap: puzzleCellMapData.cellMap
		});

		// 3. Update the puzzle with the new data
		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = {
			$set: {
				cellMap,
				publishStatus: EDITING_HINTS,
				downHints,
				acrossHints
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303,
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
				status: 200
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
