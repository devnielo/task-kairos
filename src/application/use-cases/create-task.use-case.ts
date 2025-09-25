import { CreateTaskDto } from '@/application/dto/create-task.dto';
import { Task } from '@/domain/entities/task';
import { TaskRepository } from '@/domain/repositories/task-repository';
import { PricingService } from '@/domain/services/pricing-service';
import { TaskQueueService } from '@/domain/services/task-queue-service';

interface CreateTaskUseCaseResponse {
  taskId: string;
  status: Task['status'];
  price: number;
}

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly pricingService: PricingService,
    private readonly taskQueueService: TaskQueueService,
  ) {}

  async execute(dto: CreateTaskDto): Promise<CreateTaskUseCaseResponse> {
    const price = this.pricingService.calculatePrice();

    const task = await this.taskRepository.create({
      originalPath: dto.originalPath,
      price,
    });

    await this.taskQueueService.enqueueTask({
      taskId: task.id,
      originalPath: task.originalPath,
    });

    return {
      taskId: task.id,
      status: task.status,
      price: task.price,
    };
  }
}
