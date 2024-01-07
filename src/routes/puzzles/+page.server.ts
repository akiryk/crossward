import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';

type Puzzle = Record<string, string>;

type Props = {
	puzzles: Array<Puzzle>;
};

export const load: PageServerLoad = async (): Promise<Props> => {
	// MongoDB returns the _id field by default, which is unserializable.
	// I could remove it with a projection, _id: 0, but we need it.
	const unserializablePuzzles = await puzzlesCollection
		.find({}, { limit: 10, projection: { title: 1 } })
		.toArray();

	// make the _id field serializable
	const puzzles = unserializablePuzzles.map((puzzle: Puzzle) => ({
		...puzzle,
		_id: puzzle._id.toString()
	}));

	return {
		puzzles
	};
};
