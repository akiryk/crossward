// [id] page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';
import type { Puzzles, PublishStatus, EditorPuzzle, PuzzleType } from '$utils/types';
import { GRID_SIZES, EDIT_PUZZLE } from '$utils/constants';
import { createInitialCellMap, handleSanitizeInput, createCellRows } from '$utils/serverHelpers';
import type { RequestEvent } from '../$types';

export const load: PageServerLoad = async ({ locals }): Promise<any> => {
	let session;

	/**
	 * Redirect unauthorized users to login page!
	 */
	try {
		session = await locals.getSession();
		if (!session) {
			throw new Error('not authenticated');
		}
	} catch {
		throw redirect(302, '/login');
	}

	/**
	 * Load the first ten puzzles
	 */
	// MongoDB returns the _id field by default, which is unserializable.
	// I could remove it with a projection, _id: 0, but we need it.
	try {
		const puzzlesFromDb = await puzzlesCollection
			.find({}, { limit: 10, projection: { title: 1, authorEmail: 1, publishStatus: 1 } })
			.toArray();

		// make the _id field serializable
		const shapedPuzzles = puzzlesFromDb.map((puzzle) => ({
			...puzzle,
			_id: puzzle._id.toString()
		})) as unknown as Puzzles;

		return {
			puzzles: shapedPuzzles
		};
	} catch (error) {
		return fail(500);
	}
};

export const actions = {
	create: async ({ request }: RequestEvent) => {
		let insertedId;
		try {
			const data = await request.formData();

			const unsafeTitle = data.get('title');
			if (!unsafeTitle) {
				return fail(400, { error: true, message: 'Please add a title' });
			}
			const title = handleSanitizeInput(unsafeTitle?.toString());

			const sizeName = data.get('size');
			if (typeof sizeName !== 'string' || !(sizeName in GRID_SIZES)) {
				return fail(400, { error: true, message: 'It looks like some data is missing.' });
			}

			const email = data.get('userEmail');
			if (!email || typeof email !== 'string') {
				return fail(400, { error: true, message: 'It looks like some data is missing.' });
			}

			const acrossSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const downSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const dateCreated = new Date().toISOString();

			const cellMap = createInitialCellMap(acrossSpan, downSpan);
			const cellRows = createCellRows({ cellMap, acrossSpan, downSpan });

			// Specify the update to set a value for the plot field
			const document: Omit<EditorPuzzle, '_id'> = {
				acrossHints: [],
				acrossSpan,
				authorEmail: email,
				cellMap,
				cellRows,
				dateCreated,
				downHints: [],
				downSpan,
				publishStatus: EDIT_PUZZLE,
				puzzleType: sizeName as PuzzleType,
				title
			};

			try {
				/**
				 * result will be an object with two fields:
				 * acknowledged: true,
				 * insertedId: new ObjectId('65a5829185a9dd4ebca2d1d9')
				 */
				const result = await puzzlesCollection.insertOne(document);

				if (!result.insertedId) {
					return fail(500, { error: true, message: 'Unable to save a new puzzle right now' });
				}

				insertedId = result.insertedId;
			} catch {
				return fail(500, {
					error: true,
					message:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		} catch (error) {
			return fail(500, {
				error: true,
				message: 'Something went wrong!'
			});
		}
		redirect(302, `/puzzles/${insertedId}/editGrid?create=true`);
	}
};
