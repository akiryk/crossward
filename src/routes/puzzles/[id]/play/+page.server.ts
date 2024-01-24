import mongodb, { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { cleanCellMapForDb, handleSanitizeInput, transformPuzzleForClient } from '$utils/helpers';
import type { PageServerLoad, RequestEvent } from '../$types';
import type { CellMap } from '$utils/types';
import { pageServerLoad } from '../serverHelpers';

export const load: PageServerLoad = pageServerLoad;

export const actions = {
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
		const cleanedCellMap: CellMap = cleanCellMapForDb(parsedCellMap);

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
					location: `/puzzles/${id}`
				}
			};
		} catch {
			//
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
