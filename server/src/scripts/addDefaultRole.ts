/**
 * Migration script: Add default "user" role to all existing users
 * 
 * Run with: npx tsx server/src/scripts/addDefaultRole.ts
 * 
 * This script adds a `role` field with value "user" to all users
 * that don't already have a role set.
 */

import { MongoClient } from 'mongodb';

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const dbName = uri.split('/').pop()?.split('?')[0] || 'tripmind-ai';
    const db = client.db(dbName);

    const usersCollection = db.collection('user');

    const usersWithoutRole = await usersCollection.countDocuments({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' },
      ],
    });

    console.log(`Found ${usersWithoutRole} users without a role field.`);

    if (usersWithoutRole === 0) {
      console.log('All users already have a role. Nothing to do.');
      return;
    }

    const result = await usersCollection.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: '' },
        ],
      },
      {
        $set: { role: 'user' },
      }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} users with role "user".`);

    // Show summary
    const totalUsers = await usersCollection.countDocuments();
    const admins = await usersCollection.countDocuments({ role: 'admin' });
    const regularUsers = await usersCollection.countDocuments({ role: 'user' });

    console.log(`\nSummary:`);
    console.log(`  Total users: ${totalUsers}`);
    console.log(`  Admins: ${admins}`);
    console.log(`  Regular users: ${regularUsers}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
