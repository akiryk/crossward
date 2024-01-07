import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';

type Props = {
	puzzles: Array<Record<string, string>>;
};

export const load: PageServerLoad = async (): Promise<Props> => {
	// MongoDB returns the _id field by default, which is unserializable.
	// I could remove it with a projection, _id: 0, but we need it.
	const unserializablePuzzles = await puzzlesCollection
		.find({}, { limit: 10, projection: { title: 1 } })
		.toArray();

	// make the _id field serializable
	const puzzles = unserializablePuzzles.map((puzzle) => ({
		...puzzle,
		_id: puzzle._id.toString()
	}));

	return {
		puzzles
	};
};
