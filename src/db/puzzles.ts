import db from '$db/mongo';

const collection = process.env.NODE_ENV === 'development' ? 'puzzlesDev' : 'puzzles';

export const puzzlesCollection = db.collection(collection);
