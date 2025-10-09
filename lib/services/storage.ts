import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import {
  IStorageService,
  FileUploadOptions,
  FileUploadResult,
  FileUploadProgress,
  StorageFile,
  StorageBucket,
  FileUploadError,
} from '../types';

/**
 * Supabase Storage Service Implementation
 * Handles file uploads, downloads, and management using Supabase Storage
 */
export class SupabaseStorageService implements IStorageService {
  private readonly defaultBucket = 'attachments';
  private readonly defaultFolder = 'uploads';

  /**
   * Upload a single file to Supabase Storage
   */
  async uploadFile(
    fileUri: string,
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    try {
      // Validate file before upload
      const isValid = await this.validateFile(fileUri, options);
      console.log('File validation result for', fileUri, ':', isValid);
      if (!isValid) {
        throw new Error('File validation failed');
      }

      const bucket = options.bucket || this.defaultBucket;
      const folder = options.folder || this.defaultFolder;

      // Generate unique file path
      const fileName = this.generateFileName(fileUri);
      const authPrefix = options.auth_id ? `${options.auth_id}/` : '';
      const filePath = `${authPrefix}${folder}/${Date.now()}-${fileName}`;

      // Get file info
      const fileSize = await this.getFileSize(fileUri);
      const fileType = await this.getFileType(fileUri);

      // Convert file URI to Blob (React Native / Expo friendly)
      const blob = await this.fileUriToBlob(fileUri, fileType);

	  if (onProgress) {
	  	onProgress({percentage: 0, loaded: 0, total: fileSize});
	  }

      // Upload blob to Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
      });

	  if (onProgress) {
	  	onProgress({percentage: 100, loaded: 100, total: fileSize});
	  }

      if (error) {
        throw this.mapSupabaseError(error);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        id: data?.id || filePath,
        url: publicUrl,
        path: filePath,
        size: fileSize,
        type: fileType,
        name: fileName,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.handleUploadError(error);
    }
  }

  /**
   * Upload multiple files to Supabase Storage
   */
  async uploadMultipleFiles(
    fileUris: string[],
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress, index: number) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    const totalFiles = fileUris.length;

    for (let i = 0; i < fileUris.length; i++) {
      try {
        const result = await this.uploadFile(fileUris[i], options, (progress) => {
          if (onProgress) {
            onProgress(
              {
                ...progress,
                percentage: (i * 100 + progress.percentage) / totalFiles,
              },
              i
            );
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(this.defaultBucket).remove([path]);

      return !error;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  /**
   * Delete multiple files from Supabase Storage
   */
  async deleteMultipleFiles(paths: string[]): Promise<boolean[]> {
    const results = await Promise.all(paths.map((path) => this.deleteFile(path)));
    return results;
  }

  /**
   * Get file information from Supabase Storage
   */
  async getFileInfo(path: string): Promise<StorageFile | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.defaultBucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          search: path.split('/').pop(),
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      const file = data[0];
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.defaultBucket).getPublicUrl(path);

      return {
        id: file.id || path,
        name: file.name || '',
        path: path,
        url: publicUrl,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || '',
        uploadedAt: file.created_at || '',
        uploadedBy: file.metadata?.uploadedBy || '',
      };
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folder?: string): Promise<StorageFile[]> {
    try {
      const folderPath = folder || this.defaultFolder;
      const { data, error } = await supabase.storage.from(this.defaultBucket).list(folderPath);

      if (error || !data) {
        return [];
      }

      return data.map((file) => {
        const filePath = `${folderPath}/${file.name}`;
        const {
          data: { publicUrl },
        } = supabase.storage.from(this.defaultBucket).getPublicUrl(filePath);

        return {
          id: file.id || filePath,
          name: file.name || '',
          path: filePath,
          url: publicUrl,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || '',
          uploadedAt: file.created_at || '',
          uploadedBy: file.metadata?.uploadedBy || '',
        };
      });
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(path: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from(this.defaultBucket).getPublicUrl(path);
    return publicUrl;
  }

  /**
   * Get signed URL for a file (for private files)
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.defaultBucket)
        .createSignedUrl(path, expiresIn);

      if (error || !data) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      throw error;
    }
  }

  /**
   * Create a new storage bucket
   */
  async createBucket(name: string, options: { public?: boolean } = {}): Promise<StorageBucket> {
    try {
      const { data, error } = await supabase.storage.createBucket(name, {
        public: options.public ?? false,
      });

      if (error) {
        throw error;
      }

      return {
        id: name,
        name: name,
        public: options.public ?? false,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to create bucket:', error);
      throw error;
    }
  }

  /**
   * List all storage buckets
   */
  async listBuckets(): Promise<StorageBucket[]> {
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error || !data) {
        return [];
      }

      return data.map((bucket) => ({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        createdAt: bucket.created_at,
      }));
    } catch (error) {
      console.error('Failed to list buckets:', error);
      return [];
    }
  }

  /**
   * Delete a storage bucket
   */
  async deleteBucket(name: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.deleteBucket(name);
      return !error;
    } catch (error) {
      console.error('Failed to delete bucket:', error);
      return false;
    }
  }

  /**
   * Validate file before upload
   */
  async validateFile(fileUri: string, options: FileUploadOptions = {}): Promise<boolean> {
    try {
      // Check if URI is valid
      if (!fileUri || fileUri.trim() === '') {
        console.log('File validation failed: URI is null, undefined, or empty');
        return false;
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.log('File validation failed: file does not exist at URI:', fileUri);
        return false;
      }

      const fileSize = fileInfo.size || 0;
      const fileType = await this.getFileType(fileUri);

      console.log('Validating file:', {
        uri: fileUri,
        exists: fileInfo.exists,
        size: fileSize,
        type: fileType,
        maxSize: options.maxSize,
        allowedTypes: options.allowedTypes,
      });

      // Check if file is empty
      if (fileSize === 0) {
        console.log('File validation failed: file is empty (0 bytes)');
        return false;
      }

      // Check file size
      if (options.maxSize && fileSize > options.maxSize) {
        console.log('File validation failed: file too large', {
          size: fileSize,
          maxSize: options.maxSize,
        });
        return false;
      }

      // Check file type
      if (options.allowedTypes && !options.allowedTypes.includes(fileType)) {
        console.log('File validation failed: invalid file type', {
          detectedType: fileType,
          allowedTypes: options.allowedTypes,
        });
        return false;
      }

      console.log('File validation passed');
      return true;
    } catch (error) {
      console.error('File validation failed:', error);
      return false;
    }
  }

  /**
   * Get file size from URI
   */
  async getFileSize(fileUri: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const size = fileInfo.exists ? fileInfo.size || 0 : 0;
      console.log('Getting file size for:', fileUri, 'Size:', size, 'bytes');
      return size;
    } catch (error) {
      console.error('Error getting file size for:', fileUri, error);
      return 0;
    }
  }

  /**
   * Get file MIME type from URI
   */
  async getFileType(fileUri: string): Promise<string> {
    // Extract file extension and map to MIME type
    const extension = fileUri.split('.').pop()?.toLowerCase();

    console.log('Getting file type for:', fileUri, 'extension:', extension);

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
    };

    const detectedType = mimeTypes[extension || ''] || 'application/octet-stream';
    console.log('Detected MIME type:', detectedType);

    // Special handling for .txt files - if no extension detected but file looks like text
    if (detectedType === 'application/octet-stream' && fileUri.toLowerCase().includes('.txt')) {
      console.log('Detected .txt file without extension in URI, using text/plain');
      return 'text/plain';
    }

    return detectedType;
  }

  /**
   * Generate a unique file name
   */
  private generateFileName(fileUri: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = fileUri.split('.').pop() || 'unknown';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Convert file URI to a binary payload suitable for Supabase upload.
   * Returns a Blob when available, otherwise a Uint8Array.
   *
   * For Expo/React Native we:
   * - Read base64 via `expo-file-system`
   * - Decode base64 to `Uint8Array` (no Node Buffer)
   * - Try to construct a `Blob` (preferred); otherwise return the `Uint8Array`
   */
  private async fileUriToBlob(fileUri: string, mimeType: string): Promise<Blob | Uint8Array> {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const bytes = this.base64ToUint8Array(base64);

      // Try to return a Blob if available in the runtime
      if (typeof Blob !== 'undefined') {
        try {
          return new Blob([bytes], { type: mimeType });
        } catch (blobErr) {
          console.warn('Blob construction failed, falling back to Uint8Array:', blobErr);
        }
      }

      // Fallback: return the Uint8Array (supabase-js accepts Uint8Array)
      return bytes;
    } catch (err) {
      console.error('Failed to convert file URI to binary payload:', err);
      throw err;
    }
  }

  /**
   * Decode a base64 string into a Uint8Array without using Node Buffer.
   * Works in pure JS environments (React Native / Expo).
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    // Strip any data URI prefix (if present)
    const cleaned = base64.replace(/^data:.*;base64,/, '').replace(/[^A-Za-z0-9+/=]/g, '');

    if (cleaned.length === 0) {
      return new Uint8Array(0);
    }

    // Use native atob if available (faster). Otherwise decode manually.
    if (typeof globalThis.atob === 'function') {
      const binary = globalThis.atob(cleaned);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    // Manual base64 decode fallback (no Buffer)
    const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < lookup.length; i++) lookup[i] = 255;
    for (let i = 0; i < b64chars.length; i++) lookup[b64chars.charCodeAt(i)] = i;
    lookup['='.charCodeAt(0)] = 0;

    const len = cleaned.length;
    // calculate output length
    const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
    const bytesLength = Math.floor((len * 3) / 4) - padding;
    const bytes = new Uint8Array(bytesLength);

    let byteIndex = 0;
    for (let i = 0; i < len; i += 4) {
      const a = lookup[cleaned.charCodeAt(i)];
      const b = lookup[cleaned.charCodeAt(i + 1)];
      const c = lookup[cleaned.charCodeAt(i + 2)];
      const d = lookup[cleaned.charCodeAt(i + 3)];

      const triple = (a << 18) | (b << 12) | (c << 6) | d;

      if (byteIndex < bytesLength) bytes[byteIndex++] = (triple >> 16) & 0xff;
      if (byteIndex < bytesLength) bytes[byteIndex++] = (triple >> 8) & 0xff;
      if (byteIndex < bytesLength) bytes[byteIndex++] = triple & 0xff;
    }

    return bytes;
  }

  /**
   * Map Supabase errors to our error types
   */
  private mapSupabaseError(error: any): FileUploadError {
    if (error.message?.includes('permission')) {
      return {
        code: 'PERMISSION_DENIED',
        message: 'Permission denied to upload file',
        details: error,
      };
    }

    if (error.message?.includes('size')) {
      return {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the limit',
        details: error,
      };
    }

    return {
      code: 'UPLOAD_FAILED',
      message: error.message || 'Upload failed',
      details: error,
    };
  }

  /**
   * Handle upload errors
   */
  private handleUploadError(error: any): FileUploadError {
    if (error.code) {
      return error;
    }

    return {
      code: 'UPLOAD_FAILED',
      message: error.message || 'Upload failed',
      details: error,
    };
  }
}
