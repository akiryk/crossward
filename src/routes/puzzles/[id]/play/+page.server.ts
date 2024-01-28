// PLAY SERVER
import { ServerErrorType } from '$utils/types';
import { ObjectId } from 'mongodb';
import { fail, redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { userPuzzlesCollection } from '$db/userPuzzles';
import type { PageServerLoad } from './$types';
import type {
	CellMap,
	Hint,
	CellMapArray,
	CellMap,
	DynamicCellMap,
	PuzzleWithId
} from '$utils/types';
import { transformPuzzleForClient, transformCellMapArrayForDb } from '$utils/serverHelpers';
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
	updateCellMap: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const newCellMapChunk = data.get('chunk');
		const id = data.get('id');

		if (!id || typeof id !== 'string' || !newCellMapChunk || typeof newCellMapChunk !== 'string') {
			return fail(422, {
				errorType: ServerErrorType.MISSING_FORM_DATA,
				message: 'Sorry but there was a problem.'
			});
		}

		const cellMapArrayForDb: CellMapArray = transformCellMapArrayForDb({
			cellMapArray: JSON.parse(newCellMapChunk)
		});

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = { $set: {} };

		for (const [key, value] of cellMapArrayForDb) {
			// @ts-expect-error this looks weird but is MongoDb syntax
			// In Javascript, you might instead say set.cellMap["0:0"], but that doesn't work in Mongo
			updateDocument.$set[`cellMap.${key}`] = value;
		}

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200
			};
		} catch {
			return fail(500, {
				errorType: ServerErrorType.DB_ERROR
			});
		}
	}
};
