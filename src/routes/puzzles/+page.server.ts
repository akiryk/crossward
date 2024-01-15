import { redirect, fail } from '@sveltejs/kit';
import { goto } from '$app/navigation';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';
import type { Puzzle, Puzzles, PublishStatus } from '$utils/types';
import { GRID_SIZES, DRAFT } from '$utils/constants';

type Props = {
	puzzles: Array<Puzzle>;
};

export const load: PageServerLoad = async ({ locals, url }): Promise<Props> => {
	let session;

	try {
		session = await locals.getSession();
		if (!session) {
			throw new Error('not authenticated');
		}
	} catch {
		throw redirect(302, '/login');
	}

	// MongoDB returns the _id field by default, which is unserializable.
	// I could remove it with a projection, _id: 0, but we need it.
	try {
		const unserializablePuzzles = await puzzlesCollection
			.find({}, { limit: 10, projection: { title: 1 } })
			.toArray();

		// make the _id field serializable
		const puzzles = unserializablePuzzles.map((puzzle) => ({
			...puzzle,
			_id: puzzle._id.toString()
		})) as unknown as Puzzles;

		const isDeleteSuccess = url.searchParams.get('isDeleteSuccess');
		return {
			puzzles,
			isDeleteSuccess: isDeleteSuccess === 'true'
		};
	} catch (error) {
		console.log('error', error);
		return { puzzles: [] };
	}
};

export const actions = {
	create: async ({ request }) => {
		try {
			const data = await request.formData();
			const sizeName = data.get('size');

			if (typeof sizeName !== 'string' || !(sizeName in GRID_SIZES)) {
				throw new Error('Oops! Can you please select a size?');
			}

			const title = data.get('title') || new Date().toLocaleString();
			const email = data.get('userEmail');
			const crossSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const downSpan = GRID_SIZES[sizeName as keyof typeof GRID_SIZES];
			const dateCreated = new Date().toISOString();
			const publishStatus: PublishStatus = DRAFT;

			// Specify the update to set a value for the plot field
			const document = {
				title,
				authorEmail: email,
				crossSpan,
				downSpan,
				dateCreated,
				publishStatus,
				puzzleType: sizeName
			};

			try {
				const result = await puzzlesCollection.insertOne(document);
				if (result.insertedId) {
					goto(`/puzzles/${result.insertedId}`);
				} else {
					throw new Error();
				}
			} catch {
				return fail(500, {
					error:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		} catch (error: { message: string }) {
			return fail(422, {
				error: error.message
			});
		}
	}
};
