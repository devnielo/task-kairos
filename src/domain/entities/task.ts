export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task {
  id: string;
  originalPath: string;
  status: TaskStatus;
  price: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  originalPath: string;
  price: number;
}
