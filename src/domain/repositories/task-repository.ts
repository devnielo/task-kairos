import { Task, TaskImage, TaskStatus } from '@/domain/entities/task';

export interface CreateTaskParams {
  originalPath: string;
  price: number;
}

export interface UpdateTaskParams {
  status?: TaskStatus;
  error?: string;
  images?: TaskImage[];
  updatedAt?: Date;
}

export interface TaskRepository {
  create(params: CreateTaskParams): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  update(id: string, params: UpdateTaskParams): Promise<Task>;
}
