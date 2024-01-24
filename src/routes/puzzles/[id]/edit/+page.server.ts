// [id]/editPuzzle/page.server.ts
import mongodb, { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { EDIT_HINTS } from '$utils/constants';
import { cleanCellMapForDb, handleSanitizeInput, createDisplayNumbers } from '$utils/helpers';
import { pageServerLoad } from '../serverHelpers';
import type { RequestEvent } from './$types';
import type { CellMap } from '$utils/types';

export const load = pageServerLoad;

export const actions = {
	createHints: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const cellMapString = data.get('cellMap');
		const cellsArrayString = data.get('cellsArray');

		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			// log error
			return;
		}
		if (
			!cellMapString ||
			typeof cellMapString !== 'string' ||
			!cellsArrayString ||
			typeof cellsArrayString !== 'string'
		) {
			// TODO: log error
			return;
		}

		const cellMap = JSON.parse(cellMapString);

		const cellsArray = JSON.parse(cellsArrayString);
		createDisplayNumbers(cellMap, cellsArray);

		const cleanedCellMap: CellMap = cleanCellMapForDb({
			cellMap,
			clearValues: true
		});

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = {
			$set: {
				cellMap: cleanedCellMap,
				publishStatus: EDIT_HINTS
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

		const parsedCellMap = JSON.parse(cellMap);
		const cleanedCellMap: CellMap = cleanCellMapForDb({ cellMap: parsedCellMap });

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = {
			$set: {
				cellMap: cleanedCellMap
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}/edit`
				}
			};
		} catch {
			//ol,.
		}
	},
	updateTitle: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const originalTitle = data.get('originalTitle');
		const newTitle = handleSanitizeInput({
			data,
			inputName: 'title',
			fallback: new Date().toLocaleString()
		});

		try {
			const filter = { title: originalTitle };
			// Specify the update to set a value for the plot field
			const updateDocument = {
				$set: {
					title: newTitle
				}
			};
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				title: newTitle,
				success: true
			};
		} catch (error) {
			return fail(422, {
				error
			});
		}
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		try {
			const id = data.get('id');
			if (typeof id === 'string') {
				const query = { _id: new mongodb.ObjectId(id) };
				const isDeleted = await puzzlesCollection.deleteOne(query);
				if (!isDeleted) {
					throw new Error();
				}
			}
		} catch {
			throw new Error('Error: Unable to delete this puzzle');
		}
		redirect(302, `/puzzles?isDeleteSuccess=true`);
	}
};
