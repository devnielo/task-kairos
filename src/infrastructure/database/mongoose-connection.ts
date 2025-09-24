import mongoose from 'mongoose';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

mongoose.set('strictQuery', true);

export const connectMongo = async (): Promise<typeof mongoose> => {
  const connectionString = `${env.mongo.uri}/${env.mongo.dbName}`;

  try {
    const connection = await mongoose.connect(connectionString, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info({ connectionString }, 'Connected to MongoDB');
    return connection;
  } catch (error) {
    logger.error({ error, connectionString }, 'MongoDB connection failed');
    throw error;
  }
};

export const disconnectMongo = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting from MongoDB');
  }
};
