// lib/types.ts
// Shared types for the application

// ReportData: Centralized type for incident reports, derived from the original IncidentReport structure
export interface ReportData {
  // Basic Information
  incident_category: string;
  incident_subcategory: string;
  incident_title: string;
  incident_date: string;
  incident_time: string;

  // Location Information
  street_address: string;
  nearby_landmark: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  brief_description: string;

  // Detailed Information
  what_happened: string;
  who_was_involved: string;
  number_of_witnesses: string;
  injuries_reported: string;
  property_damage: string;
  suspect_description: string;
  witness_contact_info: string;

  // Options
  request_follow_up: boolean;
  share_with_community: boolean;
  is_anonymous: boolean;
}

// Emergency Contact types
export interface EmergencyContact {
  id: string;
  name?: string;
  phoneNumber: string;
  type: 'quick' | 'community' | 'emergency';
  createdAt: string;
}

export type ContactStorageType = 'quick' | 'community' | 'emergency';

// Storage Interface Types
export interface FileUploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  compressImages?: boolean;
  quality?: number; // 0-1 for images
}

export interface FileUploadResult {
  id: string;
  url: string;
  path: string;
  size: number;
  type: string;
  name: string;
  uploadedAt: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadError {
  code: 'PERMISSION_DENIED' | 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR';
  message: string;
  details?: any;
}

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
}

// Storage Service Interface
export interface IStorageService {
  // File Upload Operations
  uploadFile(
    fileUri: string,
    options?: FileUploadOptions,
    onProgress?: (progress: FileUploadProgress) => void
  ): Promise<FileUploadResult>;

  uploadMultipleFiles(
    fileUris: string[],
    options?: FileUploadOptions,
    onProgress?: (progress: FileUploadProgress, index: number) => void
  ): Promise<FileUploadResult[]>;

  // File Management Operations
  deleteFile(path: string): Promise<boolean>;
  deleteMultipleFiles(paths: string[]): Promise<boolean[]>;
  getFileInfo(path: string): Promise<StorageFile | null>;
  listFiles(folder?: string): Promise<StorageFile[]>;

  // URL Operations
  getPublicUrl(path: string): string;
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  // Bucket Operations
  createBucket(name: string, options?: { public?: boolean }): Promise<StorageBucket>;
  listBuckets(): Promise<StorageBucket[]>;
  deleteBucket(name: string): Promise<boolean>;

  // Utility Operations
  validateFile(fileUri: string, options?: FileUploadOptions): Promise<boolean>;
  getFileSize(fileUri: string): Promise<number>;
  getFileType(fileUri: string): Promise<string>;
}

// File Picker Interface
export interface IFilePickerService {
  pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<string | null>;

  pickDocument(options?: { type?: string[] }): Promise<string | null>;

  pickMultipleImages(options?: { maxCount?: number }): Promise<string[]>;

  takePhoto(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<string | null>;

  recordAudio(options?: { maxDuration?: number }): Promise<string | null>;
}

// Upload Manager Interface
export interface IUploadManager {
  upload(
    files: string | string[],
    options?: FileUploadOptions,
    onProgress?: (progress: FileUploadProgress, index?: number) => void
  ): Promise<FileUploadResult | FileUploadResult[]>;

  cancel(uploadId: string): boolean;
  pause(uploadId: string): boolean;
  resume(uploadId: string): boolean;

  getUploadStatus(
    uploadId: string
  ): 'pending' | 'uploading' | 'paused' | 'completed' | 'cancelled' | 'failed';
}
