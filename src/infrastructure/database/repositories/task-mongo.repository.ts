import { Types } from 'mongoose';

import { Task, TaskImage } from '@/domain/entities/task';
import {
  CreateTaskParams,
  TaskRepository,
  UpdateTaskParams,
} from '@/domain/repositories/task-repository';
import { AppError } from '@/shared/errors/app-error';

import { TaskDocument, TaskModel } from '../models/task.model';

const mapTaskDocumentToDomain = (doc: TaskDocument): Task => {
  const images: TaskImage[] = (doc.images ?? []).map((image) => ({
    resolution: image.resolution,
    path: image.path,
    hash: image.hash,
    format: image.format,
  }));

  return {
    id: doc._id.toString(),
    originalPath: doc.originalPath,
    status: doc.status,
    price: doc.price,
    error: doc.error,
    images,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export class TaskMongoRepository implements TaskRepository {
  async create(params: CreateTaskParams): Promise<Task> {
    const created = await TaskModel.create({
      originalPath: params.originalPath,
      status: 'pending',
      price: params.price,
    });

    return mapTaskDocumentToDomain(created.toObject());
  }

  async findById(id: string): Promise<Task | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const found = await TaskModel.findById(id).lean<TaskDocument>().exec();

    if (!found) {
      return null;
    }

    return mapTaskDocumentToDomain(found);
  }

  async update(id: string, params: UpdateTaskParams): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError({
        message: 'Task not found',
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
      });
    }

    const updatePayload: Record<string, unknown> = {};

    if (params.status) {
      updatePayload.status = params.status;
    }

    if (typeof params.error === 'string') {
      updatePayload.error = params.error;
    }

    if (params.images) {
      updatePayload.images = params.images.map((image) => ({
        resolution: image.resolution,
        path: image.path,
        hash: image.hash,
        format: image.format,
      }));
    }

    updatePayload.updatedAt = params.updatedAt ?? new Date();

    const updated = await TaskModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, lean: true },
    ).exec();

    if (!updated) {
      throw new AppError({
        message: 'Task not found',
        statusCode: 404,
        code: 'TASK_NOT_FOUND',
      });
    }

    return mapTaskDocumentToDomain(updated as TaskDocument);
  }
}

export const taskMongoRepository = new TaskMongoRepository();
