import mongodb, { ObjectId } from 'mongodb';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { cleanCellMapForDb, handleSanitizeInput, transformPuzzleForClient } from '$utils/helpers';
import type { PageServerLoad } from './$types';
import type { PuzzleWithId, Puzzle, CellMap } from '$utils/types';

type Props = {
	puzzle: Puzzle;
	isEditing: boolean;
	isCreateSuccess: boolean;
};

export const load: PageServerLoad = async ({ params, url, locals }): Promise<Props> => {
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

		// console.log(puzzleFromDb.title);
		// console.log(puzzleFromDb.cellMap['0:0']);

		const puzzleWithId = {
			...puzzleFromDb,
			_id: puzzleFromDb._id.toString()
		} as unknown as PuzzleWithId;
		const puzzle = transformPuzzleForClient(puzzleWithId);
		const edit = url.searchParams.get('edit');
		const create = url.searchParams.get('create');

		return {
			puzzle,
			isEditing: edit === 'true',
			isCreateSuccess: create === 'true'
		};
	} catch (error) {
		// @ts-expect-error in catch block
		return fail(422, {
			error
		});
	}
};

export const actions = {
	updateCellMap: async ({ request }) => {
		const data = await request.formData();
		const cellMap = data.get('cellMap');
		const id = data.get('id');
		if (!id || typeof id !== 'string') {
			// log error
			return;
		}
		if (!cellMap || typeof cellMap !== 'string') {
			// TODO: log error
			return;
		}

		const parsedCellMap = JSON.parse(cellMap);
		const cleanedCellMap: CellMap = cleanCellMapForDb(parsedCellMap);

		const filter = {
			_id: new ObjectId(id)
		};
		const updateDocument = {
			$set: {
				cellMap: cleanedCellMap
			}
		};

		try {
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				status: 303, // HTTP status for "See Other"
				headers: {
					location: `/puzzles/${id}?edit=true`
				}
			};
		} catch {
			//
		}
	},
	updateTitle: async ({ request }) => {
		const data = await request.formData();
		const originalTitle = data.get('originalTitle');
		const newTitle = handleSanitizeInput({
			data,
			inputName: 'title',
			fallback: new Date().toLocaleString()
		});

		try {
			const filter = { title: originalTitle };
			// Specify the update to set a value for the plot field
			const updateDocument = {
				$set: {
					title: newTitle
				}
			};
			await puzzlesCollection.updateOne(filter, updateDocument);
			return {
				title: newTitle,
				success: true
			};
		} catch (error) {
			return fail(422, {
				error
			});
		}
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		try {
			const id = data.get('id');
			if (typeof id === 'string') {
				const query = { _id: new mongodb.ObjectId(id) };
				const isDeleted = await puzzlesCollection.deleteOne(query);
				if (!isDeleted) {
					throw new Error();
				}
			}
		} catch {
			throw new Error('Error: Unable to delete this puzzle');
		}
		redirect(302, `/puzzles?isDeleteSuccess=true`);
	}
};
