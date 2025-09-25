import { config as loadEnv } from 'dotenv';
import path from 'node:path';

const ENV_PATH = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

loadEnv({ path: ENV_PATH });

export interface EnvConfig {
  node: {
    env: string;
    port: number;
  };
  mongo: {
    uri: string;
    dbName: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  storage: {
    inputDir: string;
    outputDir: string;
  };
  queue: {
    name: string;
  };
  pricing: {
    min: number;
    max: number;
  };
}

const rootDir = path.resolve(__dirname, '..', '..', '..');

export const env: EnvConfig = {
  node: {
    env: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
  },
  mongo: {
    uri: process.env.MONGO_URI ?? 'mongodb://mongo:27017',
    dbName: process.env.MONGO_DB ?? 'image_processing',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'redis',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD,
  },
  storage: {
    inputDir:
      process.env.STORAGE_INPUT_DIR ?? path.join(rootDir, 'storage', 'input'),
    outputDir:
      process.env.STORAGE_OUTPUT_DIR ?? path.join(rootDir, 'storage', 'output'),
  },
  queue: {
    name: process.env.TASK_QUEUE_NAME ?? 'task-processing-queue',
  },
  pricing: {
    min: Number(process.env.TASK_PRICE_MIN ?? 5),
    max: Number(process.env.TASK_PRICE_MAX ?? 50),
  },
};
