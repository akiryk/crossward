import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	editpageServerLoad,
	handleUpdateTitle,
	handleDeletePuzzle,
	validateHintsForPublishingPuzzle
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { EDIT_PUZZLE, PUBLISHED } from '$utils/constants';
import { type Hint, type HintDirection, type CellMap } from '$utils/types';

export const load = editpageServerLoad;

export const actions = {
	updateHints: async ({ request }: RequestEvent) => {
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
					message: 'Unable to save at least some of the hints!'
				});
			}
		}
		// Return *after* the loop completes
		return {
			status: 200,
			message: `Saved at ${new Date().toLocaleTimeString().replace('AM', '')}`
		};
	},
	// User can go back to editing grid after they've started making hints.
	returnToGrid: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(422, {
				message: 'Missing puzzle id.'
			});
		}

		try {
			const filter = {
				_id: new ObjectId(id)
			};

			const document = {
				$set: {
					publishStatus: EDIT_PUZZLE
				}
			};
			await puzzlesCollection.updateOne(filter, document);
		} catch {
			fail(500);
		}
		return {
			status: 200,
			message: 'Edit grid again'
		};
	},
	publish: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(422, {
				message: 'Missing puzzle id, so unable to publish.'
			});
		}

		// 1. get hints and cellMap puzzle from the DB
		let result;
		try {
			result = await puzzlesCollection.findOne(
				{
					_id: new ObjectId(id)
				},
				{
					projection: {
						acrossHints: 1,
						downHints: 1,
						cellMap: 1
					}
				}
			);

			if (result === null) {
				throw new Error('no puzzle hints have been created');
			}
		} catch {
			return fail(500, {
				message: 'Unable to publish: the source puzzle may have been deleted.'
			});
		}

		const { acrossHints, downHints, cellMap } = result;

		if (!acrossHints || !downHints) {
			return fail(400, {
				message: 'Problem getting hints data across the wire'
			});
		}

		// 2. Validate that all hints have been filled in
		try {
			const isValid = validateHintsForPublishingPuzzle(acrossHints, downHints);
			if (!isValid) {
				throw new Error();
			}
		} catch (error) {
			return fail(400, {
				message: 'Please add hints to for every word'
			});
		}
		// 3. Remove values from the cells, leave only correctValues
		Object.values(cellMap as CellMap).forEach((cell) => {
			cell.value = '';
		});

		// 4. save the puzzle as published
		try {
			const filter = {
				_id: new ObjectId(id)
			};

			const document = {
				$set: {
					publishStatus: PUBLISHED,
					cellMap
				}
			};

			await puzzlesCollection.updateOne(filter, document);
		} catch {
			return fail(500);
		}

		return {
			status: 200,
			message: 'Congratulations, the puzzle is published!'
		};
	},
	updateTitle: async ({ request }: RequestEvent) => {
		return await handleUpdateTitle(request);
	},
	delete: async ({ request }: RequestEvent) => {
		return await handleDeletePuzzle(request);
	}
};
