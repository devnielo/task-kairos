import { GetTaskParamsDto } from '@/application/dto/get-task.dto';
import { TaskRepository } from '@/domain/repositories/task-repository';
import { AppError } from '@/shared/errors/app-error';

interface GetTaskUseCaseResponse {
  taskId: string;
  status: string;
  price: number;
  originalPath: string;
  error?: string;
  images: Array<{
    resolution: number;
    path: string;
    format: string;
  }>;
}

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(params: GetTaskParamsDto): Promise<GetTaskUseCaseResponse> {
    const task = await this.taskRepository.findById(params.taskId);

    if (!task) {
      throw new AppError({
        message: 'Task not found',
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
      });
    }

    return {
      taskId: task.id,
      status: task.status,
      price: task.price,
      originalPath: task.originalPath,
      error: task.error,
      images: task.images.map((image) => ({
        resolution: image.resolution,
        path: image.path,
        format: image.format,
      })),
    };
  }
}
