// [id]/create/page.server.ts
import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import {
	editpageServerLoad,
	handleUpdateTitle,
	handleDeletePuzzle,
	transformPuzzleDataForCreatingHints,
	transformCellMapArrayForDb,
	validateHintsForPublishingPuzzle,
	createCellRows
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';
import { EDITING_HINTS, EDIT_PUZZLE, PUBLISHED } from '$utils/constants';
import type {
	CellMapArray,
	EditorPuzzle,
	Hint,
	HintDirection,
	CellMap,
	CellRows
} from '$utils/types';
import { ServerErrorType } from '$utils/types';

export type LoadData = {
	puzzle: EditorPuzzle; // Assuming EditorPuzzle is defined elsewhere
	isCreateSuccess: boolean; // Include other properties as needed, marking optional ones appropriately
};

export const load = editpageServerLoad;

export const actions = {
	updateCellMap: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const newCellMapChunk = data.get('chunk');
		const id = data.get('id');
		if (!id || typeof id !== 'string' || !newCellMapChunk || typeof newCellMapChunk !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Hmmm... something went wrong over the wires. Maybe try again?'
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
				status: 200,
				message: `Saved at ${new Date().toLocaleTimeString().replace('AM', '')}`
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR,
				message: 'Ugh, we messed up somewhere back here in the internet. Want to try again?'
			});
		}
	},
	createHints: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Unable to create hints. Please try again.'
			});
		}
		// 1. Retrieve the completed cellMap
		let puzzle;
		try {
			puzzle = await puzzlesCollection.findOne(
				{
					_id: new ObjectId(id)
				},
				{ projection: { cellMap: 1, acrossSpan: 1, downSpan: 1 } }
			);
			if (puzzle === null || puzzle.cellMap === null) {
				// TODO: Redirect to some kind of help page
				throw redirect(300, '/');
			}
		} catch (error) {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR,
				message:
					"Uh oh. We're having trouble with the ole internet wires. Maybe try again in a week."
			});
		}

		// 2. Use the cellMap to create the hints
		const { cellMap, acrossHints, downHints } = transformPuzzleDataForCreatingHints({
			initialCellMap: puzzle.cellMap
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
			const cellRows: CellRows = createCellRows({
				cellMap,
				acrossSpan: puzzle.acrossSpan,
				downSpan: puzzle.downSpan
			});

			return {
				cellMap,
				cellRows,
				downHints,
				acrossHints
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR,
				message: 'Again, the DB failed again!'
			});
		}
	},
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
	},
	revertToGrid: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');

		if (!id || typeof id !== 'string') {
			return fail(422, {
				message: 'Missing puzzle id.'
			});
		}

		// 1. Get the existing puzzle
		let puzzle;
		try {
			puzzle = await puzzlesCollection.findOne(
				{
					_id: new ObjectId(id)
				},
				{ projection: { cellMap: 1 } }
			);
			if (puzzle === null || puzzle.cellMap === null) {
				// TODO: Redirect to some kind of help page
				throw redirect(300, '/');
			}
		} catch (error) {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR,
				message:
					"Uh oh. We're having trouble with the ole internet wires. Maybe try again in a week."
			});
		}

		// 2. reset all displayNumbers to zero
		const cellMap: CellMap = puzzle.cellMap;
		Object.values(cellMap).forEach((cell) => {
			cellMap[cell.id].displayNumber = 0;
		});

		// 4. update puzzle with the new data
		const filter = {
			_id: new ObjectId(id)
		};

		const document = {
			$set: {
				cellMap,
				publishStatus: EDIT_PUZZLE,
				downHints: [],
				acrossHints: []
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, document);
		} catch {
			fail(500);
		}
		return {
			cellMap,
			downHints: [],
			acrossHints: []
		};
	}
};
