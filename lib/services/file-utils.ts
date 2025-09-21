import { FileUploadOptions } from '../types';

/**
 * File utility functions for validation and processing
 */
export class FileUtils {
  /**
   * Validate file size
   */
  static validateFileSize(fileSize: number, maxSize?: number): boolean {
    if (!maxSize) return true;
    return fileSize <= maxSize;
  }

  /**
   * Validate file type
   */
  static validateFileType(fileType: string, allowedTypes?: string[]): boolean {
    if (!allowedTypes || allowedTypes.length === 0) return true;
    return allowedTypes.includes(fileType);
  }

  /**
   * Get file extension from URI
   */
  static getFileExtension(fileUri: string): string {
    const parts = fileUri.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get MIME type from file extension
   */
  static getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',

      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      rtf: 'text/rtf',
      odt: 'application/vnd.oasis.opendocument.text',

      // Spreadsheets
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      ods: 'application/vnd.oasis.opendocument.spreadsheet',

      // Presentations
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      odp: 'application/vnd.oasis.opendocument.presentation',

      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/m4a',
      aac: 'audio/aac',

      // Video
      mp4: 'video/mp4',
      avi: 'video/avi',
      mov: 'video/quicktime',
      wmv: 'video/wmv',
      flv: 'video/flv',
      webm: 'video/webm',

      // Archives
      zip: 'application/zip',
      rar: 'application/rar',
      '7z': 'application/x-7z-compressed',
      tar: 'application/x-tar',
      gz: 'application/gzip',

      // Other
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file type is an image
   */
  static isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  /**
   * Check if file type is a video
   */
  static isVideoFile(fileType: string): boolean {
    return fileType.startsWith('video/');
  }

  /**
   * Check if file type is audio
   */
  static isAudioFile(fileType: string): boolean {
    return fileType.startsWith('audio/');
  }

  /**
   * Check if file type is a document
   */
  static isDocumentFile(fileType: string): boolean {
    return (
      fileType.includes('document') ||
      fileType.includes('pdf') ||
      fileType.startsWith('text/') ||
      fileType.includes('spreadsheet') ||
      fileType.includes('presentation')
    );
  }

  /**
   * Get common file type groups
   */
  static getFileTypeGroups() {
    return {
      images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/rtf',
        'application/vnd.oasis.opendocument.text',
      ],
      spreadsheets: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/vnd.oasis.opendocument.spreadsheet',
      ],
      presentations: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.presentation',
      ],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
      video: ['video/mp4', 'video/avi', 'video/quicktime', 'video/wmv', 'video/flv', 'video/webm'],
    };
  }

  /**
   * Get allowed file types for a specific category
   */
  static getAllowedTypesForCategory(category: 'images' | 'documents' | 'all'): string[] {
    const groups = this.getFileTypeGroups();

    switch (category) {
      case 'images':
        return groups.images;
      case 'documents':
        return [...groups.documents, ...groups.spreadsheets, ...groups.presentations];
      case 'all':
      default:
        return [
          ...groups.images,
          ...groups.documents,
          ...groups.spreadsheets,
          ...groups.presentations,
          ...groups.audio,
          ...groups.video,
        ];
    }
  }

  /**
   * Generate a preview URL for a file (for images)
   */
  static generatePreviewUrl(fileUri: string, width?: number, height?: number): string {
    // This would typically involve image resizing logic
    // For now, just return the original URI
    return fileUri;
  }

  /**
   * Validate file upload options
   */
  static validateUploadOptions(options: FileUploadOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.maxSize && options.maxSize <= 0) {
      errors.push('maxSize must be greater than 0');
    }

    if (options.quality !== undefined && (options.quality < 0 || options.quality > 1)) {
      errors.push('quality must be between 0 and 1');
    }

    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const invalidTypes = options.allowedTypes.filter((type) => !type.includes('/'));
      if (invalidTypes.length > 0) {
        errors.push('allowedTypes must be valid MIME types');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
