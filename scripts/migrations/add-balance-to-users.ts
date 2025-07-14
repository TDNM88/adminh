import { getMongoDb } from '@/lib/mongodb';

async function migrate() {
  try {
    const db = await getMongoDb();
    
    // Update all users to include the balance field if it doesn't exist
    const result = await db.collection('users').updateMany(
      { 
        $or: [
          { balance: { $exists: false } },
          { 'balance.available': { $exists: false } },
          { 'balance.frozen': { $exists: false } },
          { 'balance.updatedAt': { $exists: false } }
        ]
      },
      {
        $set: {
          'balance.available': { $ifNull: ['$balance.available', 0] },
          'balance.frozen': { $ifNull: ['$balance.frozen', 0] },
          'balance.updatedAt': { $ifNull: ['$balance.updatedAt', new Date()] }
        }
      }
    );

    console.log(`Migration completed. Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
