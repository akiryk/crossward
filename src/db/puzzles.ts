import db from '$db/mongo';

type Collection = 'puzzlesDev' | 'puzzles';

const collection: Collection = process.env.NODE_ENV === 'development' ? 'puzzlesDev' : 'puzzles';

export const puzzlesCollection = db.collection(collection);
