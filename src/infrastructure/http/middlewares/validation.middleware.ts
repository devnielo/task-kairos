import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { AppError } from '@/shared/errors/app-error';

type ValidationTarget = 'body' | 'params' | 'query';

const parseWithSchema = (schema: ZodSchema, data: unknown) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError({
        message: 'Validation failed',
        statusCode: 422,
        code: 'VALIDATION_ERROR',
        details: {
          issues: error.issues,
        },
      });
    }

    throw error;
  }
};

interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const targets: ValidationTarget[] = ['body', 'params', 'query'];

    for (const target of targets) {
      const schema = schemas[target];
      if (schema) {
        const result = parseWithSchema(schema, req[target]);
        (req as Record<ValidationTarget, unknown>)[target] = result;
      }
    }

    next();
  };
};
