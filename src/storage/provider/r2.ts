import { storageConfig } from '../config/storage-config';
import { getR2Bucket } from '../get-bucket';
import {
  ConfigurationError,
  type StorageConfig,
  StorageError,
  type StorageProvider,
  UploadError,
  type UploadFileParams,
  type UploadFileResult,
} from '../types';

/**
 * Cloudflare R2 storage provider using the Worker bucket binding (no SDK).
 */
export class R2Provider implements StorageProvider {
  private config: StorageConfig;

  constructor(config: StorageConfig = storageConfig) {
    this.config = config;
  }

  getProviderName(): string {
    return 'R2';
  }

  private generateUniqueFilename(originalFilename: string): string {
    const extension = originalFilename.split('.').pop() || '';
    const uuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${uuid}${extension ? `.${extension}` : ''}`;
  }

  async uploadFile(params: UploadFileParams): Promise<UploadFileResult> {
    try {
      const { file, filename, contentType, folder } = params;
      const bucket = getR2Bucket();

      const uniqueFilename = this.generateUniqueFilename(filename);
      const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

      const body = file instanceof Blob ? file : new Uint8Array(file as Buffer);
      await bucket.put(key, body, {
        httpMetadata: { contentType },
      });

      const { publicUrl } = this.config;
      const url = publicUrl ? `${publicUrl.replace(/\/$/, '')}/${key}` : key;

      return { url, key };
    } catch (error) {
      if (error instanceof ConfigurationError) throw error;
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during file upload';
      throw new UploadError(message);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucket = getR2Bucket();
      await bucket.delete(key);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during file deletion';
      throw new StorageError(message);
    }
  }
}
