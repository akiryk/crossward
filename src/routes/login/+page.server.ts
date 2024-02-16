// Login Server
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	/**
	 * Redirect logged-in users to the main page
	 */
	const session = await locals.getSession();
	if (session?.user?.email) {
		throw redirect(302, '/');
	}
};
