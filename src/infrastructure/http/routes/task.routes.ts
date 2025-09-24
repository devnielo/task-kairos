import { Router } from 'express';

export const taskRouter = Router();

// Temporary placeholder handlers; will be replaced with use-case powered controllers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
taskRouter.post('/', async (_req, res) => {
  return res.status(501).json({ message: 'Not implemented yet' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
taskRouter.get('/:taskId', async (_req, res) => {
  return res.status(501).json({ message: 'Not implemented yet' });
});
