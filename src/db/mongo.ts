import { MongoClient } from 'mongodb';
import { MONGO_DB_PASSWORD } from '$env/static/private';

const uri = `mongodb+srv://akiryk:${MONGO_DB_PASSWORD}@gcpcrosswardcluster.rqmhylf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

export async function startMongo(): Promise<MongoClient> {
	return client.connect();
}

export default client.db('crossword_puzzle_game');
