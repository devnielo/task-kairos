import { GetTaskUseCase } from '../../src/application/use-cases/get-task.use-case';
import { TaskRepository } from '../../src/domain/repositories/task-repository';
import { AppError } from '../../src/shared/errors/app-error';

describe('GetTaskUseCase', () => {
  const taskRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  } as jest.Mocked<TaskRepository>;

  const taskId = '66f39b9f5213c4fafa0c1234';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return task data when task exists', async () => {
    const task = {
      id: taskId,
      originalPath: '/input/sample.jpg',
      status: 'completed' as const,
      price: 42,
      error: undefined,
      images: [
        {
          resolution: 1024,
          path: '/output/sample/1024/hash.jpg',
          hash: 'abc',
          format: 'jpeg',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskRepository.findById.mockResolvedValue(task);

    const useCase = new GetTaskUseCase(taskRepository);

    const result = await useCase.execute({ taskId });

    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(result).toEqual({
      taskId: task.id,
      status: task.status,
      price: task.price,
      originalPath: task.originalPath,
      error: task.error,
      images: task.images.map(({ resolution, path, format }) => ({
        resolution,
        path,
        format,
      })),
    });
  });

  it('should throw AppError when task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null);

    const useCase = new GetTaskUseCase(taskRepository);

    await expect(useCase.execute({ taskId })).rejects.toBeInstanceOf(AppError);

    await expect(useCase.execute({ taskId })).rejects.toMatchObject({
      statusCode: 404,
      code: 'TASK_NOT_FOUND',
    });
  });
});
