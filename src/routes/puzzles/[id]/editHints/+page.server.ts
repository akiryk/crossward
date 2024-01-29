import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	pageServerLoad,
	handleUpdateTitle,
	handleDelete,
	validateHintsForPublishingPuzzle
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { PUBLISHED } from '$utils/constants';
import { ServerErrorType, type Hint, type HintDirection } from '$utils/types';

export const load = pageServerLoad;

export const actions = {
	updateHintChunks: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const chunk = data.get('chunk');
		const direction = data.get('direction');
		const id = data.get('id');
		if (
			!id ||
			typeof id !== 'string' ||
			!chunk ||
			typeof chunk !== 'string' ||
			!direction ||
			typeof direction !== 'string'
		) {
			return fail(400, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Missing puzzle id or data.'
			});
		}

		const parsedChunk: Array<Hint> = JSON.parse(chunk);
		const typeSafeDirection: HintDirection = direction as HintDirection;
		// Loop through the hints in the chunked array.
		// Use the 'acrossHints.$' syntax to replace hints that are already in the array
		// or add new ones if they don't exist
		for (const hint of parsedChunk) {
			const fieldName =
				typeSafeDirection === 'across' ? 'acrossHints.displayNumber' : 'downHints.displayNumber';
			const filter = { _id: new ObjectId(id), [fieldName]: hint.displayNumber };
			let updateDocument;
			if (typeSafeDirection === 'across') {
				updateDocument = {
					$set: {
						'acrossHints.$': hint
					}
				};
			} else {
				updateDocument = {
					$set: {
						'downHints.$': hint
					}
				};
			}
			try {
				await puzzlesCollection.updateOne(filter, updateDocument);
			} catch {
				return fail(500, {
					errorType: ServerErrorType.DB_ERROR
				});
			}
		}
		// Return *after* the loop completes
		return {
			status: 200
		};
	},
	updateHints: async ({ request }: RequestEvent) => {
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
				errorType: ServerErrorType.MISSING_FORM_DATA
			});
		}

		const filter = {
			_id: new ObjectId(id)
		};

		const updateDocument = {
			$set: { acrossHints: JSON.parse(acrossHints), downHints: JSON.parse(downHints) }
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200,
				successType: 'updated'
			};
		} catch {
			return fail(500, {
				message: 'We seem to be losing our minds. Can you return in a week or so?',
				errorType: ServerErrorType.DB_ERROR
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
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
		}

		const parsedAcrossHints = JSON.parse(acrossHints);
		const parsedDownHints = JSON.parse(downHints);
		const isValid = validateHintsForPublishingPuzzle(parsedAcrossHints, parsedDownHints);

		if (!isValid) {
			return fail(422, {
				errorType: ServerErrorType.PUBLISH_INCOMPLETE_HINTS,
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
				status: 200,
				successType: 'published'
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR,
				message: 'Please add hints to all the across and down words.'
			});
		}
	},
	updateTitle: handleUpdateTitle,
	delete: handleDelete
};
