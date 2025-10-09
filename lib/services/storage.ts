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
			const filePath = `${folder}/${Date.now()}-${fileName}`;

			// Get file info
			const fileSize = await this.getFileSize(fileUri);
			const fileType = await this.getFileType(fileUri);

			// Upload file - Note: For React Native, you would need to convert the file URI to a blob
			// This is a simplified implementation - actual implementation would need proper file handling
			const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileUri, {
				cacheControl: '3600',
				upsert: false,
			});

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
