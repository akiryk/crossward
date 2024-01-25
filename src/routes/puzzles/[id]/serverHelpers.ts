import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { transformPuzzleForClient } from '$utils/serverHelpers';
import type { PageServerLoad } from './$types';
import type { PuzzleWithId, Puzzle } from '$utils/types';

type Props = {
	puzzle: Puzzle;
	isCreateSuccess: boolean;
};

export const pageServerLoad: PageServerLoad = async ({ params, url, locals }): Promise<Props> => {
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
			_id: new ObjectId(params.id)
		});

		if (puzzleFromDb === null) {
			// TODO: Redirect to somekind of help page
			// explaining that this puzzle may not exist anymore
			throw redirect(300, '/');
		}

		const puzzleWithId = {
			...puzzleFromDb,
			_id: puzzleFromDb._id.toString()
		} as unknown as PuzzleWithId;
		const puzzle = transformPuzzleForClient(puzzleWithId);
		const create = url.searchParams.get('create');

		return {
			puzzle,
			isCreateSuccess: create === 'true'
		};
	} catch (error) {
		// @ts-expect-error in catch block
		return fail(422, {
			error
		});
	}
};
