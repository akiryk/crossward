// [id]/editPuzzle/page.server.ts
import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
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
import { ServerErrorType } from '$utils/types';
import type { CellMap, DynamicCellMap, Hint } from '$utils/types';

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
		const cellMap = data.get('cellMap');
		const id = data.get('id');
		console.log(`save id ${id}`);
		if (!id || typeof id !== 'string' || !cellMap || typeof cellMap !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
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
