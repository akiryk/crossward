import { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import type { PageServerLoad } from './$types';
import type { Puzzle } from '$utils/types';

type Props = {
	puzzle: Puzzle;
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
	 * Load the puzzle data
	 */
	try {
		const puzzleFromDb = await puzzlesCollection.findOne({
			_id: new ObjectId('65a68055a8e719b113c1a122')
		});

		if (puzzleFromDb === null) {
			// TODO: Redirect to somekind of help page
			// explaining that this puzzle may not exist anymore
			throw redirect(300, '/');
		}
		const puzzle = {
			...puzzleFromDb,
			_id: puzzleFromDb._id.toString()
		} as unknown as Puzzle;

		/**
		 * Create the puzzle grid
		 */

		return {
			puzzle
		};
	} catch (error) {
		// @ts-expect-error in catch block
		return fail(422, {
			error
		});
	}
};
