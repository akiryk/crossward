// Login Server
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	let session;
	/**
	 * Redirect logged-in users to the main page
	 */
	session = await locals.getSession();
	if (session?.user?.email) {
		throw redirect(302, '/');
	}
};
