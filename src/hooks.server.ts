import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import Credentials from '@auth/sveltekit/providers/credentials';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';
import { startMongo } from '$db/mongo';

/**
 * AUTH
 *
 * handle will run on every request
 */
export const handle = SvelteKitAuth({
	providers: [
		Credentials({
			name: 'name & password',
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials, request) {
				console.log('Hello!!!');
				const response = await fetch(request);
				if (!response.ok) return null;
				return (await response.json()) ?? null;
			}
		}),
		Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })
	]
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
