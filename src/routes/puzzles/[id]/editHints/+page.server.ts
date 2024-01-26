import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	pageServerLoad,
	handleUpdateTitle,
	handleDelete,
	validateHints
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { PUBLISHED, SERVER_ERROR_TYPES } from '$utils/constants';

export const load = pageServerLoad;

export const actions = {
	saveHints: async ({ request }: RequestEvent) => {
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
			return fail(400, {
				message: 'Something went wrong on our end. Please try again later.',
				errorType: SERVER_ERROR_TYPES.PUBLISH_MISSING_DATA
			});
		}

		const filter = {
			_id: new ObjectId(id)
		};

		const updateDocument = {
			$set: { acrossHints: JSON.parse(acrossHints), downHints: JSON.parse(downHints) }
		};

		const location = `/puzzles/${id}/editHints`;
		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: { location }
			};
		} catch {
			return fail(500, {
				message: 'We seem to be losing our minds. Can you return in a week or so?',
				errorType: SERVER_ERROR_TYPES.SAVE_FAIL_TO_SAVE
			});
		}
	},
	publish: async ({ request }: RequestEvent) => {
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
			return fail(422, {
				errorType: SERVER_ERROR_TYPES.PUBLISH_MISSING_DATA,
				message: 'Sorry but there was a problem.'
			});
		}

		const parsedAcrossHints = JSON.parse(acrossHints);
		const parsedDownHints = JSON.parse(downHints);
		const isValid = validateHints(parsedAcrossHints, parsedDownHints);

		if (!isValid) {
			return fail(422, {
				errorType: SERVER_ERROR_TYPES.PUBLISH_INCOMPLETE_HINTS,
				message: 'Please add hints to all the across and down words.'
			});
		}

		const filter = {
			_id: new ObjectId(id)
		};

		const updateDocument = {
			$set: {
				acrossHints: JSON.parse(acrossHints),
				downHints: JSON.parse(downHints),
				publishStatus: PUBLISHED
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200 // HTTP status for "See Other"
			};
		} catch {
			return {
				status: 500
			};
		}
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
}) {}
