import db from '$db/mongo';

export const getPuzzlesCollection = () => {
	console.log(process.env.NODE_ENV);
	return db.collection('puzzles');
};
