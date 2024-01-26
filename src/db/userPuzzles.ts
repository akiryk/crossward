import db from '$db/mongo';

type Collection = 'userPuzzlesDev' | 'userPuzzles';

const collection: Collection =
	process.env.NODE_ENV === 'development' ? 'userPuzzlesDev' : 'userPuzzles';

export const userPuzzlesCollection = db.collection(collection);
