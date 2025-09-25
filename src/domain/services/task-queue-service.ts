export interface TaskQueueService {
  enqueueTask(payload: { taskId: string; originalPath: string }): Promise<void>;
}
