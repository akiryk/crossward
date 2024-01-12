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

export const actions = {
	update: async ({ request }) => {
		const data = await request.formData();
		const originalTitle = data.get('originalTitle');
		const newTitle = data.get('title');
		try {
			if (newTitle === '') {
				throw new Error('Puzzle must have a newTitle');
			}
			if (newTitle === 'The Best Puzzle') {
				throw new Error("You must not call your puzzle 'The Best Puzzle'!");
			}
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
	}
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
		const unserializablePuzzle = await puzzlesCollection.findOne({
			_id: new ObjectId(params.id)
		});

		if (unserializablePuzzle === null) {
			return { puzzle: {}, isEditing: false };
		}
		const puzzle = {
			...unserializablePuzzle,
			_id: unserializablePuzzle._id.toString()
		};

		const edit = url.searchParams.get('edit');

		return {
			puzzle,
			isEditing: edit === 'true'
		};
	} catch (error) {
		return { puzzle: {}, isEditing: false };
	}
};
