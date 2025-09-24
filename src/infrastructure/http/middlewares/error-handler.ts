import { NextFunction, Request, Response } from 'express';

import { AppError } from '@/shared/errors/app-error';
import { logger } from '@/shared/logger';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response<ErrorResponseBody> => {
  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details,
    };

    if (err.statusCode >= 500) {
      logger.error({ err }, 'Application error');
    } else {
      logger.warn({ err }, 'Handled error');
    }

    return res.status(err.statusCode).json(body);
  }

  logger.error({ err }, 'Unhandled error');

  return res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
