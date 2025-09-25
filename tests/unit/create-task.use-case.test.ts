import { CreateTaskUseCase } from '../../src/application/use-cases/create-task.use-case';
import { TaskRepository } from '../../src/domain/repositories/task-repository';
import { PricingService } from '../../src/domain/services/pricing-service';
import { TaskQueueService } from '../../src/domain/services/task-queue-service';

describe('CreateTaskUseCase', () => {
  const taskRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  } as jest.Mocked<TaskRepository>;

  const pricingService = {
    calculatePrice: jest.fn(),
  } as jest.Mocked<PricingService>;

  const taskQueueService = {
    enqueueTask: jest.fn(),
  } as jest.Mocked<TaskQueueService>;

  const originalPath = '/input/sample.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task, enqueue processing, and return task data', async () => {
    const price = 25.5;
    const createdTask = {
      id: 'task-123',
      originalPath,
      status: 'pending' as const,
      price,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    pricingService.calculatePrice.mockReturnValue(price);
    taskRepository.create.mockResolvedValue(createdTask);

    const useCase = new CreateTaskUseCase(
      taskRepository,
      pricingService,
      taskQueueService,
    );

    const result = await useCase.execute({ originalPath });

    expect(pricingService.calculatePrice).toHaveBeenCalledTimes(1);
    expect(taskRepository.create).toHaveBeenCalledWith({ originalPath, price });
    expect(taskQueueService.enqueueTask).toHaveBeenCalledWith({
      taskId: createdTask.id,
      originalPath: createdTask.originalPath,
    });
    expect(result).toEqual({
      taskId: createdTask.id,
      status: createdTask.status,
      price: createdTask.price,
    });
  });

  it('should throw if task creation fails', async () => {
    pricingService.calculatePrice.mockReturnValue(15);
    taskRepository.create.mockRejectedValue(new Error('db error'));

    const useCase = new CreateTaskUseCase(
      taskRepository,
      pricingService,
      taskQueueService,
    );

    await expect(useCase.execute({ originalPath })).rejects.toThrow('db error');

    expect(taskQueueService.enqueueTask).not.toHaveBeenCalled();
  });

  it('should propagate errors from taskQueueService', async () => {
    const price = 10;
    const createdTask = {
      id: 'task-456',
      originalPath,
      status: 'pending' as const,
      price,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    pricingService.calculatePrice.mockReturnValue(price);
    taskRepository.create.mockResolvedValue(createdTask);
    taskQueueService.enqueueTask.mockRejectedValue(new Error('queue failure'));

    const useCase = new CreateTaskUseCase(
      taskRepository,
      pricingService,
      taskQueueService,
    );

    await expect(useCase.execute({ originalPath })).rejects.toThrow('queue failure');

    expect(taskRepository.create).toHaveBeenCalledTimes(1);
  });
});
