import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const startMongoMemory = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

export const stopMongoMemory = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

export const clearMongoCollections = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
};
