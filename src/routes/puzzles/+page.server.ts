// [id] page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';
import type { Puzzle, Puzzles, PublishStatus, PuzzleDocument, PuzzleType } from '$utils/types';
import { GRID_SIZES, EDIT_PUZZLE } from '$utils/constants';
import { createInitialCellMap, handleSanitizeInput } from '$utils/helpers';

type Props = {
	puzzles: Array<Puzzle>;
};

export const load: PageServerLoad = async ({ locals }): Promise<Props> => {
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
			.find({}, { limit: 10, projection: { title: 1, publishStatus: 1 } })
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
		console.log('error', error);
		return { puzzles: [] };
	}
};

export const actions = {
	create: async ({ request }) => {
		let insertedId;
		try {
			const data = await request.formData();
			const sizeName = data.get('size');

			const title = handleSanitizeInput({
				data,
				inputName: 'title',
				fallback: new Date().toLocaleString()
			});

			const email = data.get('userEmail');
			const acrossSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const downSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const dateCreated = new Date().toISOString();
			const publishStatus: PublishStatus = EDIT_PUZZLE;

			const cellMap = createInitialCellMap(acrossSpan, downSpan);

			if (typeof sizeName !== 'string' || !(sizeName in GRID_SIZES)) {
				throw new Error('Oops! Can you please select a size?');
			}

			if (!email || typeof email !== 'string') {
				throw new Error('You need to be logged in as a user with an email');
			}

			// Specify the update to set a value for the plot field
			const document: PuzzleDocument = {
				title,
				authorEmail: email,
				dateCreated,
				publishStatus,
				puzzleType: sizeName as PuzzleType,
				acrossSpan,
				downSpan,
				cellMap,
				acrossHints: [],
				downHints: []
			};

			try {
				/**
				 * result will be an object with two fields:
				 * acknowledged: true,
				 * insertedId: new ObjectId('65a5829185a9dd4ebca2d1d9')
				 */
				const result = await puzzlesCollection.insertOne(document);

				if (!result.insertedId) {
					throw new Error('oh no! unable to save the new puzzle');
				}

				insertedId = result.insertedId;
			} catch {
				return fail(500, {
					error:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		} catch (error) {
			return fail(422, {
				error
			});
		}
		redirect(302, `/puzzles/${insertedId}/editPuzzle?create=true`);
	}
};
