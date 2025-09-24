import { Task, TaskStatus } from '@/domain/entities/task';
import { CreateImageVariantInput } from '@/domain/entities/image';

export interface CreateTaskParams {
  originalPath: string;
  price: number;
}

export interface UpdateTaskParams {
  status?: TaskStatus;
  error?: string;
  images?: CreateImageVariantInput[];
  updatedAt?: Date;
}

export interface TaskRepository {
  create(params: CreateTaskParams): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  update(id: string, params: UpdateTaskParams): Promise<Task>;
}
