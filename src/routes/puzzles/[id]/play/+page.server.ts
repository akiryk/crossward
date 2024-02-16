// PLAY SERVER
import { type EditorPuzzle } from '$utils/types';
import { ObjectId } from 'mongodb';
import { fail, redirect, type ActionFailure } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { userPuzzlesCollection } from '$db/userPuzzles';
import type { PageServerLoad } from './$types';
import {
	INCOMPLETE,
	PUBLISHED,
	COMPLETE_BUT_WITH_ERRORS,
	COMPLETE_AND_NO_ERRORS
} from '$utils/constants';
import { type CellMapArray, type PlayerPuzzle, type CellRows } from '$utils/types';
import {
	removeAnswers,
	transformCellMapArrayForDb,
	getErrorMessage,
	createCellRows
} from '$utils/serverHelpers';
import type { RequestEvent } from './$types';

export type LoadData = {
	puzzle: PlayerPuzzle;
};

function getUserId(email: string): string {
	const regex = /@|\./gi; // select all instances of either '@' or '.'
	return email.replace(regex, '_');
}

function createUserGameId({ email, puzzleId }: { email: string; puzzleId: string }): string {
	return `${getUserId(email)}_${puzzleId}`;
}

export const load: PageServerLoad = async ({
	params,
	locals
}): Promise<LoadData | ActionFailure<{ message: string }>> => {
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
	let playerPuzzle: Omit<PlayerPuzzle, 'cellRows'>;
	// Check if the user already has this puzzle underway, in which case
	// it will be found in the userPuzzlesCollection by userGameId
	try {
		const existingPlayerPuzzle = await userPuzzlesCollection.findOne({
			userGameId
		});

		if (existingPlayerPuzzle === null) {
			// Make one based on the source puzzle
			// 1. get the source puzzle by id
			const sourcePuzzle = await puzzlesCollection.findOne({
				_id: new ObjectId(params.id)
			});

			if (sourcePuzzle === null) {
				throw new Error("Ah man, we couldn't find the original puzzle!");
			}

			if ((sourcePuzzle as unknown as EditorPuzzle)?.publishStatus !== PUBLISHED) {
				throw new Error("This puzzle isn't published");
			}

			// 2. create the new playerPuzzle based on the source puzzle
			//    and extract the _id
			const {
				acrossHints,
				acrossSpan,
				authorEmail,
				cellMap,
				dateCreated,
				downHints,
				downSpan,
				publishStatus,
				puzzleType,
				title
			} = sourcePuzzle as unknown as PlayerPuzzle;

			// Use puzzleFromSource until we save it and acquire an id
			const puzzleFromSource: Omit<PlayerPuzzle, '_id' | 'cellRows'> = {
				acrossHints,
				acrossSpan,
				authorEmail,
				cellMap,
				dateCreated,
				downHints,
				downSpan,
				publishStatus,
				puzzleType,
				title,
				playMode: INCOMPLETE,
				incorrectCells: [],
				userGameId
			};

			try {
				const result = await userPuzzlesCollection.insertOne(puzzleFromSource);
				if (!result.insertedId) {
					throw new Error('oh no! unable to save the new puzzle');
				}
				const insertedId = result.insertedId;
				playerPuzzle = {
					...puzzleFromSource,
					_id: insertedId.toString()
				};
				createCellRows;
			} catch (error) {
				return fail(500, {
					message: 'Unable to create a new game puzzle.'
				});
			}
		} else {
			playerPuzzle = {
				...(existingPlayerPuzzle as unknown as PlayerPuzzle),
				_id: existingPlayerPuzzle._id.toString()
			};
		}
	} catch (error) {
		const message = getErrorMessage(
			error,
			"Sorry about that, we had a database problem. You could try again but I can't promise anything"
		);
		return fail(500, {
			message
		});
	}

	// Create cellRows every time the page loads; otherwise, the cells
	// in cellRows and in cellMap will get out of sync
	const cellRows: CellRows = createCellRows({
		cellMap: playerPuzzle.cellMap,
		acrossSpan: playerPuzzle.acrossSpan,
		downSpan: playerPuzzle.downSpan
	});
	const puzzle = {
		...playerPuzzle,
		acrossHints: removeAnswers(playerPuzzle.acrossHints),
		downHints: removeAnswers(playerPuzzle.downHints),
		cellRows
	};

	return {
		puzzle
	};
};

export const actions = {
	saveGame: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const newCellMapChunk = data.get('chunk');
		const id = data.get('id');

		if (!id || typeof id !== 'string' || !newCellMapChunk || typeof newCellMapChunk !== 'string') {
			return fail(422, {
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
			await userPuzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200,
				message: 'Success!'
			};
		} catch {
			return fail(500, { message: 'Error' });
		}
	},
	gameOver: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			return fail(422, {
				message: 'Sorry but there was a problem.'
			});
		}
		try {
			const filter = {
				_id: new ObjectId(id)
			};
			const updateDocument = {
				$set: {
					playMode: COMPLETE_AND_NO_ERRORS
				}
			};
			await userPuzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 200,
				message: 'Success!'
			};
		} catch {
			return fail(500, { message: 'Error' });
		}
	}
};
