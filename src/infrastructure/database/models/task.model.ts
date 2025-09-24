import { Schema, Types, model } from 'mongoose';

import { TaskStatus } from '@/domain/entities/task';

export type TaskDocument = {
  _id: Types.ObjectId;
  originalPath: string;
  status: TaskStatus;
  price: number;
  error?: string;
  images: {
    resolution: number;
    path: string;
    hash: string;
    format: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

const imageVariantSchema = new Schema(
  {
    resolution: { type: Number, required: true },
    path: { type: String, required: true },
    hash: { type: String, required: true },
    format: { type: String, required: true },
  },
  { _id: false },
);

const taskSchema = new Schema<TaskDocument>(
  {
    originalPath: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      required: true,
      default: 'pending',
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    error: { type: String },
    images: {
      type: [imageVariantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskSchema.index({ updatedAt: -1 });

taskSchema.set('toJSON', {
  transform: (_, doc) => {
    return {
      id: doc._id.toString(),
      originalPath: doc.originalPath,
      status: doc.status,
      price: doc.price,
      error: doc.error,
      images: doc.images,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

export const TaskModel = model<TaskDocument>('Task', taskSchema);
