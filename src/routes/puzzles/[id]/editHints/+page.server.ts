import mongodb, { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { handleSanitizeInput } from '$utils/helpers';
import type { RequestEvent } from './$types';
import { pageServerLoad } from '../serverHelpers';
import { PUBLISHED } from '$utils/constants';

export const load = pageServerLoad;

export const actions = {
	saveHints: async ({ request }: RequestEvent) => {
		updatePuzzle({ request, isPublish: false });
	},
	publish: async ({ request }: RequestEvent) => {
		const res = await updatePuzzle({ request, isPublish: true });
		if (res?.status === 303) {
			return res;
		}
		// handle error
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

async function updatePuzzle({
	request,
	isPublish = false
}: {
	request: Request;
	isPublish: boolean;
}) {
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
		return;
	}

	const filter = {
		_id: new ObjectId(id)
	};

	const setData = isPublish
		? {
				acrossHints: JSON.parse(acrossHints),
				downHints: JSON.parse(downHints),
				publishStatus: PUBLISHED
			}
		: { acrossHints: JSON.parse(acrossHints), downHints: JSON.parse(downHints) };

	const updateDocument = {
		$set: setData
	};

	const location = isPublish ? `/puzzles/${id}/play` : `/puzzles/${id}/editHints`;
	console.log('location', location);
	try {
		await puzzlesCollection.updateOne(filter, updateDocument);
		return {
			status: 303, // HTTP status for "See Other"
			headers: { location }
		};
	} catch {
		return {
			status: 500
		};
	}
}
