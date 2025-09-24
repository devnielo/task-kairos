import { Request, Response } from 'express';

export const notFoundHandler = (_req: Request, res: Response): Response => {
  return res.status(404).json({
    statusCode: 404,
    message: 'Resource not found',
    code: 'NOT_FOUND',
  });
};
