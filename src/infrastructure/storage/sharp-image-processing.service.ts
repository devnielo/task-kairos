import axios from 'axios';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import { CreateImageVariantInput } from '@/domain/entities/image';
import { ImageProcessingService } from '@/domain/services/image-processing-service';
import { env } from '@/shared/config/env';
import { md5Hash } from '@/shared/utils/hash';

const SUPPORTED_FORMATS: Array<keyof sharp.FormatEnum> = [
  'jpeg',
  'png',
  'webp',
  'avif',
  'tiff',
];

const isUrl = (input: string): boolean => {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
};

const sanitizeName = (value: string): string => {
  const sanitized = value.replace(/[^a-zA-Z0-9-_]/g, '-');
  return sanitized.length > 0 ? sanitized.toLowerCase() : 'image';
};

const ensureDirectory = async (directoryPath: string): Promise<void> => {
  await fs.mkdir(directoryPath, { recursive: true });
};

export class SharpImageProcessingService implements ImageProcessingService {
  async process(params: {
    taskId: string;
    originalPath: string;
    resolutions: number[];
  }): Promise<CreateImageVariantInput[]> {
    const { taskId, originalPath, resolutions } = params;

    const sourceBuffer = await this.loadSourceBuffer(originalPath);
    const { format: metadataFormat } = await sharp(sourceBuffer).metadata();

    const selectedFormat = this.normalizeFormat(
      metadataFormat ?? this.inferFormatFromPath(originalPath) ?? 'jpeg',
    );

    const baseFileName = this.resolveBaseName(originalPath);

    const variants: CreateImageVariantInput[] = [];

    for (const resolution of resolutions) {
      const { buffer, hash } = await this.resizeAndHash(
        sourceBuffer,
        resolution,
        selectedFormat,
      );

      const relativePath = path.posix.join(
        '/output',
        baseFileName,
        resolution.toString(),
        `${hash}.${this.extensionFromFormat(selectedFormat)}`,
      );

      const absolutePath = path.join(env.storage.outputDir, relativePath);

      await ensureDirectory(path.dirname(absolutePath));
      await fs.writeFile(absolutePath, buffer);

      variants.push({
        taskId,
        resolution,
        path: relativePath,
        hash,
        format: selectedFormat,
      });
    }

    return variants;
  }

  private async loadSourceBuffer(originalPath: string): Promise<Buffer> {
    if (isUrl(originalPath)) {
      const response = await axios.get<ArrayBuffer>(originalPath, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    }

    const absolutePath = path.isAbsolute(originalPath)
      ? originalPath
      : path.join(env.storage.inputDir, originalPath);

    return fs.readFile(absolutePath);
  }

  private normalizeFormat(format: string): keyof sharp.FormatEnum {
    const lower = format.toLowerCase();
    if (SUPPORTED_FORMATS.includes(lower as keyof sharp.FormatEnum)) {
      return lower as keyof sharp.FormatEnum;
    }

    return 'jpeg';
  }

  private inferFormatFromPath(originalPath: string): string | undefined {
    const extension = path.extname(this.extractPathname(originalPath));
    if (!extension) {
      return undefined;
    }

    return extension.replace('.', '');
  }

  private resolveBaseName(originalPath: string): string {
    const filename = path.parse(this.extractPathname(originalPath)).name;
    return sanitizeName(filename || 'image');
  }

  private extractPathname(originalPath: string): string {
    if (isUrl(originalPath)) {
      const url = new URL(originalPath);
      return url.pathname;
    }

    return originalPath;
  }

  private extensionFromFormat(format: keyof sharp.FormatEnum): string {
    return format === 'jpeg' ? 'jpg' : format;
  }

  private async resizeAndHash(
    buffer: Buffer,
    resolution: number,
    format: keyof sharp.FormatEnum,
  ): Promise<{ buffer: Buffer; hash: string }> {
    const resizedBuffer = await sharp(buffer)
      .resize({ width: resolution, withoutEnlargement: true })
      .toFormat(format)
      .toBuffer();

    const hash = md5Hash(resizedBuffer);

    return { buffer: resizedBuffer, hash };
  }
}
