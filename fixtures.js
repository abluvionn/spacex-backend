import mongoose from 'mongoose';
import config from './config.js';
import Admin from './models/Admin.js';

const dropCollection = async (db, collectionName) => {
  try {
    await db.dropCollection(collectionName);
  } catch (_e) {
    console.log(`Collection ${collectionName} was missing, skipping drop....`);
  }
};

const collections = ['admins', 'userApplications'];

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.db);
    const db = mongoose.connection;

    for (const collectionName of collections) {
      await dropCollection(db, collectionName);
    }

    await Admin.create([
      {
        email: config.admin.email,
        password: config.admin.password,
        fullName: 'Admin',
        phone: '555-1234',
      },
    ]);

    console.log('Fixture data has been successfully set up.');

    await db.close();
  } catch (e) {
    console.error('Error during fixture setup:', e);
  }
};

void run();
