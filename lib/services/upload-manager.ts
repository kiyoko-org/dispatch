import {
  IStorageService,
  IFilePickerService,
  IUploadManager,
  FileUploadOptions,
  FileUploadResult,
  FileUploadProgress,
} from '../types';

/**
 * Upload Manager Service
 * Coordinates file picking and uploading operations
 */
export class UploadManager implements IUploadManager {
  private storageService: IStorageService;
  private filePickerService: IFilePickerService;
  private activeUploads: Map<
    string,
    {
      status: 'pending' | 'uploading' | 'paused' | 'completed' | 'cancelled' | 'failed';
      abortController?: AbortController;
    }
  > = new Map();

  constructor(storageService: IStorageService, filePickerService: IFilePickerService) {
    this.storageService = storageService;
    this.filePickerService = filePickerService;
  }

  /**
   * Upload files with progress tracking
   */
  async upload(
    files: string | string[],
    options: FileUploadOptions = {},
    onProgress?: (progress: FileUploadProgress, index?: number) => void
  ): Promise<FileUploadResult | FileUploadResult[]> {
    const fileUris = Array.isArray(files) ? files : [files];
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize upload status
    this.activeUploads.set(uploadId, { status: 'uploading' });

    try {
      const results = await this.storageService.uploadMultipleFiles(fileUris, options, onProgress);

      // Update status to completed
      this.activeUploads.set(uploadId, { status: 'completed' });

      return Array.isArray(files) ? results : results[0];
    } catch (error) {
      // Update status to failed
      this.activeUploads.set(uploadId, { status: 'failed' });
      throw error;
    }
  }

  /**
   * Cancel an active upload
   */
  cancel(uploadId: string): boolean {
    const upload = this.activeUploads.get(uploadId);
    if (upload && (upload.status === 'uploading' || upload.status === 'pending')) {
      upload.status = 'cancelled';
      if (upload.abortController) {
        upload.abortController.abort();
      }
      return true;
    }
    return false;
  }

  /**
   * Pause an active upload
   */
  pause(uploadId: string): boolean {
    const upload = this.activeUploads.get(uploadId);
    if (upload && upload.status === 'uploading') {
      upload.status = 'paused';
      return true;
    }
    return false;
  }

  /**
   * Resume a paused upload
   */
  resume(uploadId: string): boolean {
    const upload = this.activeUploads.get(uploadId);
    if (upload && upload.status === 'paused') {
      upload.status = 'uploading';
      return true;
    }
    return false;
  }

  /**
   * Get upload status
   */
  getUploadStatus(
    uploadId: string
  ): 'pending' | 'uploading' | 'paused' | 'completed' | 'cancelled' | 'failed' {
    return this.activeUploads.get(uploadId)?.status || 'pending';
  }

  /**
   * Pick and upload images
   */
  async pickAndUploadImages(
    options: FileUploadOptions & {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
      maxCount?: number;
    } = {},
    onProgress?: (progress: FileUploadProgress, index?: number) => void
  ): Promise<FileUploadResult[]> {
    const fileUris = await this.filePickerService.pickMultipleImages({
      maxCount: options.maxCount,
    });

    if (fileUris.length === 0) {
      return [];
    }

    return this.upload(fileUris, options, onProgress) as Promise<FileUploadResult[]>;
  }

  /**
   * Pick and upload a single image
   */
  async pickAndUploadImage(
    options: FileUploadOptions & {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
    } = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult | null> {
    const fileUri = await this.filePickerService.pickImage({
      allowsEditing: options.allowsEditing,
      aspect: options.aspect,
      quality: options.quality,
    });

    if (!fileUri) {
      return null;
    }

    return this.upload(fileUri, options, onProgress) as Promise<FileUploadResult>;
  }

  /**
   * Take photo and upload
   */
  async takePhotoAndUpload(
    options: FileUploadOptions & {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
    } = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult | null> {
    const fileUri = await this.filePickerService.takePhoto({
      allowsEditing: options.allowsEditing,
      aspect: options.aspect,
      quality: options.quality,
    });

    if (!fileUri) {
      return null;
    }

    return this.upload(fileUri, options, onProgress) as Promise<FileUploadResult>;
  }

  /**
   * Pick document and upload
   */
  async pickDocumentAndUpload(
    options: FileUploadOptions & {
      type?: string[];
    } = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult | null> {
    console.log('UploadManager: Picking document with options:', options);

    const fileUri = await this.filePickerService.pickDocument({
      type: options.type,
    });

    console.log('UploadManager: Document picker returned URI:', fileUri);

    if (!fileUri) {
      console.log('UploadManager: No file URI returned from picker');
      return null;
    }

    console.log('UploadManager: Starting upload for URI:', fileUri);
    return this.upload(fileUri, options, onProgress) as Promise<FileUploadResult>;
  }

  /**
   * Upload recorded audio file
   */
  async uploadRecordedAudio(
    recorder: import('expo-audio').AudioRecorder, // AudioRecorder from expo-audio
    options: FileUploadOptions & {
      stopRecording?: boolean;
    } = {},
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult | null> {
    try {
      let uri: string | null = null;

      console.log('Starting audio upload process...');

      if (options.stopRecording !== false) {
        // Stop recording first
        console.log('Stopping recording...');
        await recorder.stop();
        uri = recorder.uri;
        console.log('Recording stopped, URI:', uri);
      } else {
        // Recording is already stopped, just get the URI
        uri = recorder.uri;
        console.log('Using existing recording URI:', uri);
      }

      if (!uri) {
        console.error('No audio file URI available from recorder');
        throw new Error('No audio file URI available');
      }

      // Upload the recorded file
      console.log('Uploading recorded audio file:', uri);
      return this.upload(uri, options, onProgress) as Promise<FileUploadResult>;
    } catch (error) {
      console.error('Error uploading recorded audio:', error);
      throw error;
    }
  }

  /**
   * Get all active uploads
   */
  getActiveUploads(): { id: string; status: string }[] {
    return Array.from(this.activeUploads.entries()).map(([id, upload]) => ({
      id,
      status: upload.status,
    }));
  }

  /**
   * Clear completed uploads from memory
   */
  clearCompletedUploads(): void {
    for (const [id, upload] of this.activeUploads.entries()) {
      if (
        upload.status === 'completed' ||
        upload.status === 'cancelled' ||
        upload.status === 'failed'
      ) {
        this.activeUploads.delete(id);
      }
    }
  }
}
