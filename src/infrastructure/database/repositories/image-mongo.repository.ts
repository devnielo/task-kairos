import { Types } from 'mongoose';

import { CreateImageVariantInput, ImageVariant } from '@/domain/entities/image';
import { ImageRepository } from '@/domain/repositories/image-repository';

import { ImageDocument, ImageModel } from '../models/image.model';

const mapDocumentToDomain = (doc: ImageDocument): ImageVariant => {
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
};

export class ImageMongoRepository implements ImageRepository {
  async createMany(images: CreateImageVariantInput[]): Promise<ImageVariant[]> {
    const documents = await ImageModel.insertMany(
      images.map((image) => ({
        taskId: new Types.ObjectId(image.taskId),
        resolution: image.resolution,
        path: image.path,
        hash: image.hash,
        format: image.format,
      })),
      {
        ordered: false,
      },
    );

    return documents.map((doc) => mapDocumentToDomain(doc));
  }

  async findByTaskId(taskId: string): Promise<ImageVariant[]> {
    const documents = await ImageModel.find({ taskId: new Types.ObjectId(taskId) })
      .sort({ resolution: -1 })
      .lean<ImageDocument[]>();

    return documents.map((doc) => mapDocumentToDomain(doc as ImageDocument));
  }
}

export const imageMongoRepository = new ImageMongoRepository();
