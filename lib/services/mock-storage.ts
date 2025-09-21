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
 * Mock Storage Service Implementation
 * Used for testing and development without actual storage backend
 */
export class MockStorageService implements IStorageService {
  private files: Map<string, StorageFile> = new Map();
  private buckets: Map<string, StorageBucket> = new Map();
  private uploadProgress: Map<string, FileUploadProgress> = new Map();

  /**
   * Upload a single file (mock implementation)
   */
  async uploadFile(
    fileUri: string,
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult> {
    // Simulate validation
    const isValid = await this.validateFile(fileUri, options);
    if (!isValid) {
      throw new Error('File validation failed');
    }

    const fileId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = fileUri.split('/').pop() || 'unknown-file';
    const fileType = await this.getFileType(fileUri);
    const fileSize = await this.getFileSize(fileUri);

    // Simulate upload progress
    const progressId = `upload-${fileId}`;
    this.uploadProgress.set(progressId, { loaded: 0, total: fileSize, percentage: 0 });

    // Simulate upload delay with progress updates
    await this.simulateUpload(progressId, fileSize, onProgress);

    const result: FileUploadResult = {
      id: fileId,
      url: `https://mock-storage.example.com/${fileId}`,
      path: `${options.folder || 'uploads'}/${fileName}`,
      size: fileSize,
      type: fileType,
      name: fileName,
      uploadedAt: new Date().toISOString(),
    };

    // Store file info
    this.files.set(fileId, {
      id: fileId,
      name: fileName,
      path: result.path,
      url: result.url,
      size: fileSize,
      type: fileType,
      uploadedAt: result.uploadedAt,
      uploadedBy: 'mock-user',
    });

    return result;
  }

  /**
   * Upload multiple files (mock implementation)
   */
  async uploadMultipleFiles(
    fileUris: string[],
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress, index: number) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (let i = 0; i < fileUris.length; i++) {
      try {
        const result = await this.uploadFile(fileUris[i], options, (progress) => {
          if (onProgress) {
            onProgress(
              {
                ...progress,
                percentage: (i * 100 + progress.percentage) / fileUris.length,
              },
              i
            );
          }
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${i}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Delete a file (mock implementation)
   */
  async deleteFile(path: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find file by path
    const fileEntry = Array.from(this.files.entries()).find(([, file]) => file.path === path);

    if (fileEntry) {
      this.files.delete(fileEntry[0]);
      return true;
    }

    return false;
  }

  /**
   * Delete multiple files (mock implementation)
   */
  async deleteMultipleFiles(paths: string[]): Promise<boolean[]> {
    return Promise.all(paths.map((path) => this.deleteFile(path)));
  }

  /**
   * Get file information (mock implementation)
   */
  async getFileInfo(path: string): Promise<StorageFile | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    const fileEntry = Array.from(this.files.entries()).find(([, file]) => file.path === path);

    return fileEntry ? fileEntry[1] : null;
  }

  /**
   * List files in a folder (mock implementation)
   */
  async listFiles(folder?: string): Promise<StorageFile[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const folderPath = folder || 'uploads';
    return Array.from(this.files.values()).filter((file) => file.path.startsWith(folderPath));
  }

  /**
   * Get public URL for a file (mock implementation)
   */
  getPublicUrl(path: string): string {
    const file = Array.from(this.files.values()).find((f) => f.path === path);
    return file?.url || `https://mock-storage.example.com/${path}`;
  }

  /**
   * Get signed URL for a file (mock implementation)
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    const file = Array.from(this.files.values()).find((f) => f.path === path);
    if (!file) {
      throw new Error('File not found');
    }

    // Mock signed URL with expiration
    const expiration = Date.now() + expiresIn * 1000;
    return `${file.url}?signed=true&expires=${expiration}`;
  }

  /**
   * Create a new storage bucket (mock implementation)
   */
  async createBucket(name: string, options: { public?: boolean } = {}): Promise<StorageBucket> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const bucket: StorageBucket = {
      id: name,
      name: name,
      public: options.public ?? false,
      createdAt: new Date().toISOString(),
    };

    this.buckets.set(name, bucket);
    return bucket;
  }

  /**
   * List all storage buckets (mock implementation)
   */
  async listBuckets(): Promise<StorageBucket[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return Array.from(this.buckets.values());
  }

  /**
   * Delete a storage bucket (mock implementation)
   */
  async deleteBucket(name: string): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return this.buckets.delete(name);
  }

  /**
   * Validate file before upload (mock implementation)
   */
  async validateFile(fileUri: string, options: FileUploadOptions = {}): Promise<boolean> {
    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    const fileSize = await this.getFileSize(fileUri);
    const fileType = await this.getFileType(fileUri);

    // Check file size
    if (options.maxSize && fileSize > options.maxSize) {
      return false;
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(fileType)) {
      return false;
    }

    return true;
  }

  /**
   * Get file size from URI (mock implementation)
   */
  async getFileSize(fileUri: string): Promise<number> {
    // Return random file size between 1KB and 5MB for testing
    return Math.floor(Math.random() * (5 * 1024 * 1024)) + 1024;
  }

  /**
   * Get file MIME type from URI (mock implementation)
   */
  async getFileType(fileUri: string): Promise<string> {
    const extension = fileUri.split('.').pop()?.toLowerCase();

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

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Simulate upload progress
   */
  private async simulateUpload(
    progressId: string,
    totalSize: number,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<void> {
    const chunkSize = Math.max(1024, Math.floor(totalSize / 20)); // 20 chunks
    let loaded = 0;

    while (loaded < totalSize) {
      // Simulate variable upload speed
      const delay = Math.random() * 100 + 50;
      await new Promise((resolve) => setTimeout(resolve, delay));

      loaded = Math.min(loaded + chunkSize, totalSize);
      const progress: FileUploadProgress = {
        loaded,
        total: totalSize,
        percentage: Math.round((loaded / totalSize) * 100),
      };

      this.uploadProgress.set(progressId, progress);

      if (onProgress) {
        onProgress(progress);
      }
    }
  }

  /**
   * Get mock upload progress for testing
   */
  getMockUploadProgress(uploadId: string): FileUploadProgress | null {
    return this.uploadProgress.get(uploadId) || null;
  }

  /**
   * Clear all mock data (useful for testing)
   */
  clearMockData(): void {
    this.files.clear();
    this.buckets.clear();
    this.uploadProgress.clear();
  }

  /**
   * Add mock file for testing
   */
  addMockFile(file: StorageFile): void {
    this.files.set(file.id, file);
  }

  /**
   * Get all mock files for testing
   */
  getMockFiles(): StorageFile[] {
    return Array.from(this.files.values());
  }
}
