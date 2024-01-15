import mongodb from 'mongodb';
import { handleSanitizeInput } from '$utils/sanitizers';
import { fail } from '@sveltejs/kit';
import { puzzlesCollection } from '$db/puzzles';
import { ObjectId } from 'mongodb';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

type Puzzle = Record<string, string>;

type Props = {
	puzzle: Puzzle;
	isEditing: boolean;
};

export const load: PageServerLoad = async ({ params, url, locals }): Promise<Props> => {
	let session;

	try {
		session = await locals.getSession();
		if (!session) {
			throw new Error('not authenticated');
		}
	} catch {
		throw redirect(302, '/login');
	}

	try {
		const puzzleFromDb = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (puzzleFromDb === null) {
			return { puzzle: {}, isEditing: false };
		}
		const puzzle = {
			...puzzleFromDb,
			_id: puzzleFromDb._id.toString()
		};

		const edit = url.searchParams.get('edit');

		return {
			puzzle,
			isEditing: edit === 'true'
		};
	} catch (error) {
		// @ts-expect-error in catch block
		return fail(422, {
			error
		});
	}
};

export const actions = {
	update: async ({ request }) => {
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
		} catch (error: { message: string }) {
			return fail(422, {
				error: error.message
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
