import { Job, Queue } from 'bullmq';

import { CreateTaskParams } from '@/domain/repositories/task-repository';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

import { redisConnectionOptions } from './connection';

export interface TaskQueuePayload {
  taskId: string;
  originalPath: string;
}

export const taskQueue = new Queue<TaskQueuePayload>(env.queue.name, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const enqueueTaskProcessing = async (
  task: CreateTaskParams & { id: string },
): Promise<Job<TaskQueuePayload>> => {
  const job = await taskQueue.add(
    'process-task',
    {
      taskId: task.id,
      originalPath: task.originalPath,
    },
    {
      jobId: task.id,
      delay: 0,
      attempts: 3,
    },
  );

  logger.info({ jobId: job.id, taskId: task.id }, 'Task enqueued for processing');

  return job;
};
