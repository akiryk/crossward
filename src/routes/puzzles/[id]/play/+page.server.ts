// PLAY SERVER
import type { CellMap, DynamicCellMap, PuzzleWithId } from '$utils/types';
import { ServerErrorType } from '$utils/types';
import { ObjectId } from 'mongodb';
import { fail, redirect, type ActionFailure, type Action } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { userPuzzlesCollection } from '$db/userPuzzles';
import type { PageServerLoad } from './$types';
import { transformPuzzleForClient, transformCellMapForDb } from '$utils/serverHelpers';
import type { RequestEvent } from '../$types';

function getUserId(email: string): string {
	const regex = /@|\./gi; // select all instances of either '@' or '.'
	return email.replace(regex, '_');
}

function createUserGameId({ email, puzzleId }: { email: string; puzzleId: string }): string {
	return `${getUserId(email)}_${puzzleId}`;
}

export const load: PageServerLoad = async ({ params, locals }): Promise<any> => {
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
	const email = session.user.email;
	const puzzleId = params.id;

	// Get a unique ID for each user's game based on email and puzzle ID.
	// User johndoe@example.com playing puzzle ABCD2343 would have userGameId
	// of johndoe_example_com_ABCD2342
	const userGameId = createUserGameId({ email, puzzleId });
	let playerPuzzle;

	// check if userId exists in the userGames collection
	try {
		playerPuzzle = await userPuzzlesCollection.findOne({
			userGameId
		});

		if (playerPuzzle === null) {
			// 1. get the source puzzle
			playerPuzzle = await puzzlesCollection.findOne({
				_id: new ObjectId(params.id)
			});

			if (playerPuzzle === null) {
				// TODO: Redirect to somekind of help page
				// explaining that this puzzle may not exist anymore
				throw redirect(300, '/');
			}

			// 2. create the new playerPuzzle based on the source puzzle
			const playerPuzzleDocument = { ...playerPuzzle, userGameId };
			// @ts-expect-error The returned doc will have an _id if using Mongo
			delete playerPuzzleDocument._id;
			try {
				const result = await userPuzzlesCollection.insertOne(playerPuzzleDocument);
				if (!result.insertedId) {
					throw new Error('oh no! unable to save the new puzzle');
				}
			} catch (error) {
				console.log(error);
				return fail(500, {
					error:
						"Sorry about that, we had a database problem. You could try again but I can't promise anything"
				});
			}
		}
	} catch {
		return fail(500, {
			error:
				"Sorry about that, we had a database problem. You could try again but I can't promise anything"
		});
	}

	if (!playerPuzzle) {
		throw new Error('no source puzzle from db');
	}

	const puzzleWithId = {
		...playerPuzzle,
		_id: playerPuzzle._id.toString()
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
		const cellMap = data.get('cellMap');

		if (!id || !cellMap) {
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
