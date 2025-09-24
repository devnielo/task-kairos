import { CreateImageVariantInput, ImageVariant } from '@/domain/entities/image';

export interface ImageRepository {
  createMany(images: CreateImageVariantInput[]): Promise<ImageVariant[]>;
  findByTaskId(taskId: string): Promise<ImageVariant[]>;
}
