export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface TaskImage {
  resolution: number;
  path: string;
  hash: string;
  format: string;
}

export interface Task {
  id: string;
  originalPath: string;
  status: TaskStatus;
  price: number;
  error?: string;
  images: TaskImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  originalPath: string;
  price: number;
}
