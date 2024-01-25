import { ObjectId } from 'mongodb';
import { puzzlesCollection } from '$db/puzzles';
import { pageServerLoad, handleUpdateTitle, handleDelete } from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
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
	updateTitle: handleUpdateTitle,
	delete: handleDelete
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
