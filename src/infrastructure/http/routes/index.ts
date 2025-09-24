import { Application, Router } from 'express';

import { healthRouter } from './health.routes';
import { taskRouter } from './task.routes';

export const registerRoutes = (app: Application): void => {
  const apiRouter = Router();

  apiRouter.use('/health', healthRouter);
  apiRouter.use('/tasks', taskRouter);

  app.use('/api', apiRouter);
};
