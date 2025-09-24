import { CreateImageVariantInput } from '@/domain/entities/image';

export interface ImageProcessingService {
  process(params: {
    taskId: string;
    originalPath: string;
    resolutions: number[];
  }): Promise<CreateImageVariantInput[]>;
}
