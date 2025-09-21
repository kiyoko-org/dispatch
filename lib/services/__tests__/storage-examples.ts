import { MockStorageService } from '../mock-storage';
import { FileUtils } from '../file-utils';

/**
 * Storage Service Test Examples
 *
 * This file demonstrates how to test the storage interface functionality.
 * In a real project, you would integrate this with your testing framework
 * (Jest, Mocha, etc.) and add proper assertions.
 */

export async function testStorageService() {
  console.log('Testing Storage Service...');

  const storageService = new MockStorageService();

  // Test 1: Upload a file
  try {
    const fileUri = 'file:///test-image.jpg';
    const result = await storageService.uploadFile(fileUri);

    console.log('✓ Upload test passed:', {
      id: result.id.startsWith('mock-'),
      name: result.name === 'test-image.jpg',
      type: result.type === 'image/jpeg',
      hasUrl: result.url.includes('mock-storage'),
    });
  } catch (error) {
    console.log('✕ Upload test failed:', error);
  }

  // Test 2: File validation
  try {
    const fileUri = 'file:///test.txt';
    const options = {
      maxSize: 100,
      allowedTypes: ['image/jpeg'],
    };

    await storageService.uploadFile(fileUri, options);
    console.log('✕ Validation test failed: Should have thrown error');
  } catch (error) {
    console.log('✓ Validation test passed: Correctly rejected invalid file');
  }

  // Test 3: File operations
  try {
    const fileUri = 'file:///test.jpg';
    const uploadResult = await storageService.uploadFile(fileUri);

    // Delete file
    const deleteResult = await storageService.deleteFile(uploadResult.path);
    console.log('✓ Delete test passed:', deleteResult);

    // Check file info
    const fileInfo = await storageService.getFileInfo(uploadResult.path);
    console.log('✓ File info test passed:', fileInfo === null);
  } catch (error) {
    console.log('✕ File operations test failed:', error);
  }

  // Test 4: List files
  try {
    const fileUris = ['file:///test1.jpg', 'file:///test2.png', 'file:///test3.pdf'];

    for (const uri of fileUris) {
      await storageService.uploadFile(uri);
    }

    const files = await storageService.listFiles();
    console.log('✓ List files test passed:', files.length === 3);
  } catch (error) {
    console.log('✕ List files test failed:', error);
  }

  // Test 5: Bucket operations
  try {
    const bucket = await storageService.createBucket('test-bucket', { public: true });
    console.log('✓ Create bucket test passed:', bucket.name === 'test-bucket');

    const buckets = await storageService.listBuckets();
    console.log('✓ List buckets test passed:', buckets.length > 0);

    const deleteResult = await storageService.deleteBucket('test-bucket');
    console.log('✓ Delete bucket test passed:', deleteResult);
  } catch (error) {
    console.log('✕ Bucket operations test failed:', error);
  }
}

export function testFileUtils() {
  console.log('Testing FileUtils...');

  // Test file size validation
  const sizeValid1 = FileUtils.validateFileSize(1000, 2000);
  const sizeValid2 = FileUtils.validateFileSize(3000, 2000);
  console.log('✓ File size validation:', sizeValid1 && !sizeValid2);

  // Test file type validation
  const typeValid1 = FileUtils.validateFileType('image/jpeg', ['image/jpeg', 'image/png']);
  const typeValid2 = FileUtils.validateFileType('text/plain', ['image/jpeg', 'image/png']);
  console.log('✓ File type validation:', typeValid1 && !typeValid2);

  // Test file extension
  const ext1 = FileUtils.getFileExtension('file:///test.jpg');
  const ext2 = FileUtils.getFileExtension('file:///test.tar.gz');
  console.log('✓ File extension:', ext1 === 'jpg' && ext2 === 'gz');

  // Test MIME type detection
  const mime1 = FileUtils.getMimeTypeFromExtension('jpg');
  const mime2 = FileUtils.getMimeTypeFromExtension('pdf');
  console.log('✓ MIME type detection:', mime1 === 'image/jpeg' && mime2 === 'application/pdf');

  // Test file size formatting
  const format1 = FileUtils.formatFileSize(0);
  const format2 = FileUtils.formatFileSize(1024);
  const format3 = FileUtils.formatFileSize(1024 * 1024);
  console.log(
    '✓ File size formatting:',
    format1 === '0 Bytes' && format2 === '1 KB' && format3 === '1 MB'
  );

  // Test file type identification
  const isImage = FileUtils.isImageFile('image/jpeg');
  const isVideo = FileUtils.isVideoFile('video/mp4');
  const isAudio = FileUtils.isAudioFile('audio/mpeg');
  const isDoc = FileUtils.isDocumentFile('application/pdf');
  console.log('✓ File type identification:', isImage && isVideo && isAudio && isDoc);

  // Test allowed types for categories
  const imageTypes = FileUtils.getAllowedTypesForCategory('images');
  const docTypes = FileUtils.getAllowedTypesForCategory('documents');
  const allTypes = FileUtils.getAllowedTypesForCategory('all');
  console.log(
    '✓ File type categories:',
    imageTypes.length > 0 &&
      docTypes.length > 0 &&
      allTypes.length > imageTypes.length + docTypes.length
  );
}

// Example usage:
// await testStorageService();
// testFileUtils();
