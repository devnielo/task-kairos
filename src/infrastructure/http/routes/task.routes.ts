import { Router } from 'express';

import { createTaskSchema } from '@/application/dto/create-task.dto';
import { getTaskParamsSchema } from '@/application/dto/get-task.dto';
import { CreateTaskUseCase } from '@/application/use-cases/create-task.use-case';
import { GetTaskUseCase } from '@/application/use-cases/get-task.use-case';
import { taskMongoRepository } from '@/infrastructure/database/repositories/task-mongo.repository';
import { TaskController } from '@/infrastructure/http/controllers/task.controller';
import { validateRequest } from '@/infrastructure/http/middlewares/validation.middleware';
import { bullTaskQueueService } from '@/infrastructure/services/bull-task-queue.service';
import { randomPricingService } from '@/infrastructure/services/random-pricing.service';

const createTaskUseCase = new CreateTaskUseCase(
  taskMongoRepository,
  randomPricingService,
  bullTaskQueueService,
);

const getTaskUseCase = new GetTaskUseCase(taskMongoRepository);

const taskController = new TaskController(createTaskUseCase, getTaskUseCase);

export const taskRouter = Router();

taskRouter.post(
  '/',
  /**
   * @openapi
   * /api/tasks:
   *   post:
   *     summary: Create a new image processing task
   *     tags:
   *       - Tasks
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - originalPath
   *             properties:
   *               originalPath:
   *                 type: string
   *                 example: /input/example.jpg
   *     responses:
   *       '201':
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 taskId:
   *                   type: string
   *                   example: 66f39b9f5213c4fafa0c1234
   *                 status:
   *                   type: string
   *                   enum: [pending, processing, completed, failed]
   *                 price:
   *                   type: number
   *                   format: float
   *       '422':
   *         description: Validation error
   */
  validateRequest({ body: createTaskSchema }),
  taskController.createTask,
);

taskRouter.get(
  '/:taskId',
  /**
   * @openapi
   * /api/tasks/{taskId}:
   *   get:
   *     summary: Retrieve an existing task by id
   *     tags:
   *       - Tasks
   *     parameters:
   *       - in: path
   *         name: taskId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Task details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 taskId:
   *                   type: string
   *                 status:
   *                   type: string
   *                   enum: [pending, processing, completed, failed]
   *                 originalPath:
   *                   type: string
   *                 price:
   *                   type: number
   *                   format: float
   *                 error:
   *                   type: string
   *                   nullable: true
   *                 images:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       resolution:
   *                         type: number
   *                       path:
   *                         type: string
   *                       format:
   *                         type: string
   *       '404':
   *         description: Task not found
   */
  validateRequest({ params: getTaskParamsSchema }),
  taskController.getTask,
);
