import mongodb, { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { handleSanitizeInput } from '$utils/helpers';
import type { RequestEvent } from './$types';
import { pageServerLoad } from '../serverHelpers';
import { GRID_SIZES, EDIT_PUZZLE, PUBLISHED, EDIT_HINTS } from '$utils/constants';

export const load = pageServerLoad;

async function getFilterAndUpdateDocument(
	request: Request,
	publishStatus: string
): Promise<{ id: string; filter: mongodb.Filter<mongodb.BSON.Document>; updateDocument: any }> {
	const data = await request.formData();
	const acrossHints = await data.get('acrossHints');
	const downHints = await data.get('downHints');
	const id = data.get('id');
	if (
		!id ||
		typeof id !== 'string' ||
		!acrossHints ||
		typeof acrossHints !== 'string' ||
		!downHints ||
		typeof downHints !== 'string'
	) {
		// log error
		throw new Error('no hinting data');
	}

	const filter = {
		_id: new ObjectId(id)
	};
	const updateDocument = {
		$set: {
			acrossHints: JSON.parse(acrossHints),
			downHints: JSON.parse(downHints),
			publishStatus
		}
	};

	return { filter, updateDocument, id };
}

export const actions = {
	saveHints: async ({ request }: RequestEvent) => {
		try {
			const { filter, updateDocument, id } = await getFilterAndUpdateDocument(request, EDIT_HINTS);
			await puzzlesCollection.updateOne(filter, updateDocument);
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
	publish: async ({ request }: RequestEvent) => {
		try {
			const { filter, updateDocument, id } = await getFilterAndUpdateDocument(request, PUBLISHED);
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}/play`
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
