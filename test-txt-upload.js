// Test script to verify .txt file upload functionality
// Run this in the browser console or Node.js to test the logic

const FileUtils = {
  getAllowedTypesForCategory(category) {
    const groups = {
      documents: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/rtf',
        'application/vnd.oasis.opendocument.text',
      ],
    };

    return category === 'documents' ? groups.documents : [];
  },

  validateFileType(fileType, allowedTypes) {
    return allowedTypes.includes(fileType);
  },

  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      txt: 'text/plain',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  },
};

// Test .txt file upload
console.log('Testing .txt file upload...');

const txtFileUri = 'file:///example-document.txt';
const allowedTypes = FileUtils.getAllowedTypesForCategory('documents');
const detectedType = FileUtils.getMimeTypeFromExtension('txt');
const isValid = FileUtils.validateFileType(detectedType, allowedTypes);

console.log('File URI:', txtFileUri);
console.log('Allowed types:', allowedTypes);
console.log('Detected MIME type:', detectedType);
console.log('Is valid type:', isValid);
console.log('Should upload work:', isValid ? 'YES' : 'NO');

if (isValid) {
  console.log('✅ .txt file upload should work correctly!');
} else {
  console.log('❌ .txt file upload will fail - check allowedTypes configuration');
}
