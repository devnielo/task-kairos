import { TaskQueueService } from '@/domain/services/task-queue-service';
import { enqueueTaskProcessing } from '@/infrastructure/queues/task.queue';

export class BullTaskQueueService implements TaskQueueService {
  async enqueueTask(payload: { taskId: string; originalPath: string }): Promise<void> {
    await enqueueTaskProcessing(payload);
  }
}

export const bullTaskQueueService = new BullTaskQueueService();
