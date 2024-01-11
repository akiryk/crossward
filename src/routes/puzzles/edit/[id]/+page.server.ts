import { puzzlesCollection } from '$db/puzzles';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';

type Puzzle = Record<string, string>;

type Props = {
	puzzle: Puzzle;
};

export const load: PageServerLoad = async ({ params }): Promise<Props> => {
	try {
		const unserializablePuzzle = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (unserializablePuzzle === null) {
			return { puzzle: {} };
		}
		const puzzle = {
			...unserializablePuzzle,
			_id: unserializablePuzzle._id.toString()
		};
		return {
			puzzle
		};
	} catch (error) {
		return { puzzle: {} };
	}
};
