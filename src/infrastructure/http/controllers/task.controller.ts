import { Request, Response, NextFunction } from 'express';

import { CreateTaskUseCase } from '@/application/use-cases/create-task.use-case';
import { GetTaskUseCase } from '@/application/use-cases/get-task.use-case';

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
  ) {}

  createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.createTaskUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTaskUseCase.execute({ taskId: req.params.taskId });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
