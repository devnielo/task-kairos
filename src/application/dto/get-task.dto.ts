import { z } from 'zod';

export const getTaskParamsSchema = z.object({
  taskId: z
    .string({ required_error: 'taskId is required' })
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, 'taskId must be a valid MongoDB ObjectId'),
});

export type GetTaskParamsDto = z.infer<typeof getTaskParamsSchema>;
