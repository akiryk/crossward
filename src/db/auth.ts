import db from '$db/mongo';

export const usersCollection = db.collection('users');
export const sessionsCollection = db.collection('sessions');
