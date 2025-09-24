import express, { Application } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found-handler';
import { registerRoutes } from './routes';
import { swaggerSpec } from './swagger';

export interface CloseableApp extends Application {
  close: () => Promise<void>;
}

export const createApp = (): CloseableApp => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.node.env !== 'test') {
    app.use(
      morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      }),
    );
  }

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const closeableApp: CloseableApp = Object.assign(app, {
    close: async () => {
      // Placeholder for resources cleanup (database connections, queues, etc.)
    },
  });

  return closeableApp;
};
