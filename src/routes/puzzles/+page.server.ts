import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';
import type { Puzzle, Puzzles } from '$utils/types';
import { redirect } from '@sveltejs/kit';

type Props = {
	puzzles: Array<Puzzle>;
};

export const load: PageServerLoad = async (props): Promise<Props> => {
	let session;

	try {
		session = await props.locals.getSession();
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

		return {
			puzzles
		};
	} catch (error) {
		console.log('error', error);
		return { puzzles: [] };
	}
};

export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		console.log('data is ', data);
	}
};
