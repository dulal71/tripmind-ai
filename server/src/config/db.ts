import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  try {
    const connString = process.env.MONGODB_URI;
    if (!connString) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    client = new MongoClient(connString);
    await client.connect();
    
    // Extract database name from connection string or default to 'tripmind-ai'
    const dbName = connString.split('/').pop()?.split('?')[0] || 'tripmind-ai';
    db = client.db(dbName);
    
    console.log(`[Database] Native MongoDB Connected to database: ${dbName}`);
    return db;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const getClient = (): MongoClient => {
  if (!client) {
    throw new Error('MongoClient not initialized. Call connectDB first.');
  }
  return client;
};
