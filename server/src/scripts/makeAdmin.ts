import { MongoClient } from 'mongodb';

const EMAIL = 'ahmdedulal4211@gmail.com';

async function makeAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not defined');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = uri.split('/').pop()?.split('?')[0] || 'tripmind-ai';
    const db = client.db(dbName);

    const result = await db.collection('user').updateOne(
      { email: EMAIL },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.error(`User with email "${EMAIL}" not found.`);
    } else if (result.modifiedCount === 1) {
      console.log(`"${EMAIL}" is now an admin!`);
    } else {
      console.log(`"${EMAIL}" already has admin role.`);
    }
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await client.close();
  }
}

makeAdmin();
