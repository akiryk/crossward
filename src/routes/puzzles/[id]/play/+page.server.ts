import type {
	CellMap,
	DynamicCellMap,
	Cell,
	ID,
	Puzzle,
	DynamicCell,
	PuzzleWithId,
	CellsArray,
	Hint,
	PuzzleDocument
} from '$utils/types';
import { Direction, ServerErrorType } from '$utils/types';
import sanitizeHtml from 'sanitize-html';
import mongodb, { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { userPuzzlesCollection } from '$db/userPuzzles';
import type { PageServerLoad } from './$types';
import { transformPuzzleForClient } from '$utils/serverHelpers';

type Props = {
	puzzle: Puzzle;
};

function getUserId(userEmail: string): string {
	const regex = /@|\./gi; // select all instances of either '@' or '.'
	return userEmail.replace(regex, '_');
}

export const load: PageServerLoad = async ({ params, url, locals }): Promise<Props> => {
	let session;
	/**
	 * Redirect unauthorized users to login page!
	 */
	try {
		session = await locals.getSession();
		if (!session || !session.user?.email) {
			throw new Error('not authenticated');
		}
	} catch {
		throw redirect(302, '/login');
	}
	const userEmail = session.user.email;
	// get user convert name@dom.com to name_dom_com
	const userId = getUserId(userEmail);
	// check if userId exists in the userGames collection
	try {
		const puzzleFromDb = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (puzzleFromDb === null) {
			// TODO: Redirect to somekind of help page
			// explaining that this puzzle may not exist anymore
			throw redirect(300, '/');
		}

		const userPuzzleFromDb = await userPuzzlesCollection.findOne({
			userId,
			gameId: params.id
		});

		if (userPuzzleFromDb === null) {
			// create the puzzle
			const document = { ...puzzleFromDb, userId, gameId: params.id };
			try {
				/**
				 * result will be an object with two fields:
				 * acknowledged: true,
				 * insertedId: new ObjectId('65a5829185a9dd4ebca2d1d9')
				 */
				const result = await userPuzzlesCollection.insertOne(document);

				if (!result.insertedId) {
					throw new Error('oh no! unable to save the new puzzle');
				}

				const insertedId = result.insertedId;
			} catch {
				return fail(500, {
					error:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		}
		console.log(userPuzzleFromDb?.gameId);
	} catch {}

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
