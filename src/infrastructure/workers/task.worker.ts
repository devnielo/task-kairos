import { Worker } from 'bullmq';

import { env } from '@/shared/config/env';
import { logger } from '@/shared/logger';

import { connectMongo, disconnectMongo } from '../database/mongoose-connection';
import { imageMongoRepository } from '../database/repositories/image-mongo.repository';
import { taskMongoRepository } from '../database/repositories/task-mongo.repository';
import { redisConnectionOptions } from '../queues/connection';
import { TaskQueuePayload } from '../queues/task.queue';
import { SharpImageProcessingService } from '../storage/sharp-image-processing.service';

const imageProcessingService = new SharpImageProcessingService();

const RESOLUTIONS = [1024, 800];

const mongoConnectionPromise = connectMongo().catch((error) => {
  logger.fatal({ err: error }, 'Failed to connect MongoDB in worker');
  process.exit(1);
});

export const taskWorker = new Worker<TaskQueuePayload>(
  env.queue.name,
  async (job) => {
    await mongoConnectionPromise;

    const { taskId, originalPath } = job.data;

    logger.info({ jobId: job.id, taskId }, 'Starting task processing');

    await taskMongoRepository.update(taskId, {
      status: 'processing',
      updatedAt: new Date(),
    });

    try {
      const variants = await imageProcessingService.process({
        taskId,
        originalPath,
        resolutions: RESOLUTIONS,
      });

      const createdVariants = await imageMongoRepository.createMany(variants);

      await taskMongoRepository.update(taskId, {
        status: 'completed',
        images: createdVariants.map((variant) => ({
          resolution: variant.resolution,
          path: variant.path,
          hash: variant.hash,
          format: variant.format,
        })),
        updatedAt: new Date(),
      });

      logger.info({ jobId: job.id, taskId }, 'Task processed successfully');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error processing task';

      logger.error(
        {
          jobId: job.id,
          taskId,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
          err: error,
        },
        'Task processing failed',
      );

      await taskMongoRepository.update(taskId, {
        status: 'failed',
        error: message,
        updatedAt: new Date(),
      });

      throw error;
    }
  },
  {
    connection: redisConnectionOptions,
  },
);

const WORKER_SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

WORKER_SHUTDOWN_SIGNALS.forEach((signal) => {
  process.on(signal, async () => {
    logger.info({ signal }, 'Shutting down task worker');
    await taskWorker.close();
    await disconnectMongo();
    process.exit(0);
  });
});

taskWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error }, 'Task worker job failed');
});

taskWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Task worker job completed');
});
