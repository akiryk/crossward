// PLAY SERVER
import type { CellMap, DynamicCellMap, Cell, ID, Puzzle, PuzzleWithId } from '$utils/types';
import { ServerErrorType } from '$utils/types';
import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { userPuzzlesCollection } from '$db/userPuzzles';
import type { PageServerLoad } from './$types';
import { transformPuzzleForClient, transformCellMapForDb } from '$utils/serverHelpers';
import type { RequestEvent } from '../$types';

type Props = {
	puzzle: Puzzle;
};

function getUserId(userEmail: string): string {
	const regex = /@|\./gi; // select all instances of either '@' or '.'
	return userEmail.replace(regex, '_');
}

export const load: PageServerLoad = async ({ params, locals }): Promise<Props> => {
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

	let userPuzzle;
	let sourcePuzzle;

	// check if userId exists in the userGames collection
	try {
		userPuzzle = await userPuzzlesCollection.findOne({
			userId,
			gameId: params.id
		});

		if (userPuzzle === null) {
			// 1. get the source puzzle
			sourcePuzzle = await puzzlesCollection.findOne({
				_id: new ObjectId(params.id)
			});

			if (sourcePuzzle === null) {
				// TODO: Redirect to somekind of help page
				// explaining that this puzzle may not exist anymore
				throw redirect(300, '/');
			}

			// 2. create the new userPuzzle based on the source puzzle
			const newUserPuzzleDocument = { ...sourcePuzzle, userId, gameId: params.id };
			try {
				const result = await userPuzzlesCollection.insertOne(newUserPuzzleDocument);

				if (!result.insertedId) {
					throw new Error('oh no! unable to save the new puzzle');
				}
			} catch {
				return fail(500, {
					error:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		}
	} catch {}

	const puzzleFromDb = userPuzzle || sourcePuzzle;

	if (!puzzleFromDb) {
		throw new Error('no source puzzle from db');
	}

	const puzzleWithId = {
		...puzzleFromDb,
		_id: puzzleFromDb._id.toString()
	} as unknown as PuzzleWithId;
	const puzzle = transformPuzzleForClient(puzzleWithId);
	return {
		puzzle
	};
};

export const actions = {
	saveGame: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');
		const gameId = data.get('gameId');
		const userId = data.get('userId');
		const cellMap = data.get('cellMap');

		if (!id || !gameId || !userId || !cellMap) {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry! Please try again to save.'
			});
		}

		const parsedCellMap: DynamicCellMap = JSON.parse(cellMap.toString());
		const cellMapForDb: CellMap = transformCellMapForDb({
			cellMap: parsedCellMap
		});

		const filter = {
			_id: new ObjectId(id.toString())
		};
		const updateDocument = {
			$set: {
				cellMap: cellMapForDb
			}
		};

		try {
			await userPuzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}/play`
				}
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR
			});
		}
	}
};
