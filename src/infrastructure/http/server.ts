import http from 'node:http';

import { connectMongo, disconnectMongo } from '@/infrastructure/database/mongoose-connection';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

import { createApp } from './app';

export const createServer = async () => {
  const app = createApp();
  await connectMongo();

  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(env.node.port, resolve);
  });

  const close = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await disconnectMongo();
  };

  app.close = async () => {
    await close();
  };

  server.on('error', (error) => {
    logger.error({ error }, 'HTTP server error');
  });

  return { app, server };
};
