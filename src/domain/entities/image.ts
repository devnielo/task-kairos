export interface ImageVariant {
  id: string;
  taskId: string;
  resolution: number;
  path: string;
  hash: string;
  format: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateImageVariantInput {
  taskId: string;
  resolution: number;
  path: string;
  hash: string;
  format: string;
}
