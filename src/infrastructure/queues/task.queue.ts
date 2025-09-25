import { Queue } from 'bullmq';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

import { redisConnectionOptions } from './connection';

export interface TaskQueuePayload {
  taskId: string;
  originalPath: string;
}

const shouldUseQueue = env.node.env !== 'test';

const taskQueue = shouldUseQueue
  ? new Queue<TaskQueuePayload>(env.queue.name, {
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
    })
  : null;

export const enqueueTaskProcessing = async (payload: TaskQueuePayload): Promise<void> => {
  if (!taskQueue) {
    logger.debug({ taskId: payload.taskId }, 'Task queue disabled; skipping enqueue');
    return;
  }

  await taskQueue.add(
    'process-task',
    {
      taskId: payload.taskId,
      originalPath: payload.originalPath,
    },
    {
      jobId: payload.taskId,
      delay: 0,
      attempts: 3,
    },
  );

  logger.info({ taskId: payload.taskId }, 'Task enqueued for processing');
};
