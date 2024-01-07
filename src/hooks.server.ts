import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';
import { startMongo } from '$db/mongo';

/**
 * AUTH
 *
 * handle will run on every request
 */
export const handle = SvelteKitAuth({
	providers: [Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })]
});

/**
 * MONGO DB
 *
 * only handle runs on every request; this will run only whenever server
 * is reloaded and that's it
 */
startMongo()
	.then(() => {
		console.log(`🚀🚀🚀🚀🚀🚀🚀 Mongo Started!`);
	})
	.catch((error) => console.error(error));
