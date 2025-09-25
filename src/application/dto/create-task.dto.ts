import { z } from 'zod';

export const createTaskSchema = z.object({
  originalPath: z
    .string({ required_error: 'originalPath is required' })
    .trim()
    .min(1, 'originalPath cannot be empty')
    .max(1024, 'originalPath is too long'),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
