import { SvelteKitAuth } from '@auth/sveltekit';
import { redirect } from '@sveltejs/kit';
import argon2 from 'argon2';
import Google from '@auth/sveltekit/providers/google';
import Credentials from '@auth/sveltekit/providers/credentials';
import { GOOGLE_ID, GOOGLE_SECRET, TEST_EMAIL_ACCOUNT } from '$env/static/private';
import { startMongo } from '$db/mongo';
import { usersCollection } from '$db/auth';

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
			async authorize(credentials) {
				let user = null;
				if (
					!credentials?.password ||
					typeof credentials.password !== 'string' ||
					!credentials?.username ||
					typeof credentials.username !== 'string'
				) {
					return user;
				}
				const { username, password } = credentials;

				try {
					const userCredentials = await usersCollection.findOne({
						username
					});
					const hash = userCredentials?.hash || '';
					if (await argon2.verify(hash, password)) {
						user = {
							name: username,
							email: TEST_EMAIL_ACCOUNT,
							id: userCredentials?._id.toString()
						};
					} else {
						console.log('Fail to verify');
					}
				} catch {
					console.log('Did not find a matching user');
				}

				return user;

				// To test enabling new users, uncomment this:

				// const hash = await argon2.hash(password);
				// const document = {
				// 	username,
				// 	hash
				// };

				// try {
				// 	const result = await usersCollection.insertOne(document);
				// 	if (result.insertedId) {
				// 		user = {
				// 			name: username,
				// 			email: 'adamkiryk@gmail.com',
				// 			id: result.insertedId.toString()
				// 		};
				// 	}
				// } catch {
				// 	//
				// }
			}
		}),
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET
		})
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
