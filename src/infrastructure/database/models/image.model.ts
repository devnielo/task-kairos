import { Schema, Types, model } from 'mongoose';

export type ImageDocument = {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  resolution: number;
  path: string;
  hash: string;
  format: string;
  createdAt: Date;
  updatedAt: Date;
};

const imageSchema = new Schema<ImageDocument>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    resolution: { type: Number, required: true },
    path: { type: String, required: true },
    hash: { type: String, required: true, index: true },
    format: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

imageSchema.index({ taskId: 1, resolution: 1 }, { unique: true });

imageSchema.set('toJSON', {
  transform: (_, doc) => {
    return {
      id: doc._id.toString(),
      taskId: doc.taskId.toString(),
      resolution: doc.resolution,
      path: doc.path,
      hash: doc.hash,
      format: doc.format,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

export const ImageModel = model<ImageDocument>('Image', imageSchema);
