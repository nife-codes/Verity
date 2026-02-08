import { extractMetadata } from '../utils/metadataExtractor.js';

/**
 * File Processor Service
 * Handles file upload processing, metadata extraction, and base64 conversion
 * for Gemini API integration.
 */

// Configuration
const USE_MOCK = false; // Set to true for development without API calls
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total limit

// Supported file types
const SUPPORTED_TYPES = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic'],
    video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
    pdf: ['application/pdf'],
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
function validateFileType(file) {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Check against supported types
    const allSupportedTypes = Object.values(SUPPORTED_TYPES).flat();

    if (allSupportedTypes.includes(fileType)) {
        return { valid: true };
    }

    // Special case for PDFs (sometimes type is empty)
    if (fileName.endsWith('.pdf')) {
        return { valid: true };
    }

    return {
        valid: false,
        error: `Unsupported file type: ${fileType || 'unknown'}. Supported types: images, videos, audio, and PDFs.`,
    };
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
function validateFileSize(file) {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
    }
    return { valid: true };
}

/**
 * Validate total size of multiple files
 * @param {File[]} files - Files to validate
 * @returns {Object} Validation result
 */
function validateTotalSize(files) {
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    if (totalSize > MAX_TOTAL_SIZE) {
        return {
            valid: false,
            error: `Total file size exceeds maximum of ${MAX_TOTAL_SIZE / (1024 * 1024)}MB`,
        };
    }
    return { valid: true };
}

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 encoded string
 */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };

        reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Get file category from MIME type
 * @param {string} mimeType - MIME type of file
 * @returns {string} Category (image, video, audio, pdf, unknown)
 */
function getFileCategory(mimeType) {
    const type = mimeType.toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type === 'application/pdf') return 'pdf';

    return 'unknown';
}

/**
 * Process a single file
 * @param {File} file - File to process
 * @returns {Promise<Object>} Processed file data
 */
export async function processFile(file) {
    try {
        // Validate file type
        const typeValidation = validateFileType(file);
        if (!typeValidation.valid) {
            return {
                success: false,
                error: typeValidation.error,
                fileName: file.name,
            };
        }

        // Validate file size
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
            return {
                success: false,
                error: sizeValidation.error,
                fileName: file.name,
            };
        }

        // Extract metadata
        const metadataResult = await extractMetadata(file);

        // Convert to base64 (unless in mock mode)
        let base64 = null;
        if (!USE_MOCK) {
            base64 = await fileToBase64(file);
        }

        // Build structured response
        const processedFile = {
            success: true,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category: getFileCategory(file.type),
            lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
            metadata: metadataResult.metadata || {},
            metadataExtracted: metadataResult.success,
            metadataError: metadataResult.error || null,
            base64: base64,
            // Include raw EXIF for advanced analysis if available
            rawMetadata: metadataResult.rawExif || metadataResult.rawMetadata || null,
        };

        return processedFile;
    } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        return {
            success: false,
            error: error.message,
            fileName: file.name,
        };
    }
}

/**
 * Process multiple files
 * @param {File[]} files - Array of files to process
 * @returns {Promise<Object>} Processing results
 */
export async function processFiles(files) {
    try {
        // Validate inputs
        if (!files || files.length === 0) {
            return {
                success: false,
                error: 'No files provided',
                files: [],
            };
        }

        // Validate total size
        const totalSizeValidation = validateTotalSize(files);
        if (!totalSizeValidation.valid) {
            return {
                success: false,
                error: totalSizeValidation.error,
                files: [],
            };
        }

        // Process all files in parallel
        const processedFiles = await Promise.all(
            files.map(file => processFile(file))
        );

        // Separate successful and failed files
        const successful = processedFiles.filter(f => f.success);
        const failed = processedFiles.filter(f => !f.success);

        return {
            success: failed.length === 0,
            totalFiles: files.length,
            successfulFiles: successful.length,
            failedFiles: failed.length,
            files: processedFiles,
            errors: failed.length > 0 ? failed.map(f => ({ fileName: f.fileName, error: f.error })) : null,
        };
    } catch (error) {
        console.error('Error processing files:', error);
        return {
            success: false,
            error: error.message,
            files: [],
        };
    }
}

/**
 * Prepare files for Gemini API
 * Formats processed files into the structure expected by Gemini
 * @param {Object[]} processedFiles - Array of processed file objects
 * @returns {Object} Gemini API ready payload
 */
export function prepareForGeminiAPI(processedFiles) {
    const validFiles = processedFiles.filter(f => f.success && f.base64);

    return {
        files: validFiles.map(file => ({
            name: file.fileName,
            mimeType: file.fileType,
            data: file.base64,
        })),
        metadata: validFiles.map(file => ({
            fileName: file.fileName,
            category: file.category,
            extractedMetadata: file.metadata,
            fileSize: file.fileSize,
            lastModified: file.lastModified,
        })),
    };
}

/**
 * Generate summary statistics for processed files
 * @param {Object} processResult - Result from processFiles()
 * @returns {Object} Summary statistics
 */
export function getProcessingSummary(processResult) {
    if (!processResult.success && processResult.files.length === 0) {
        return {
            total: 0,
            successful: 0,
            failed: 0,
            categories: {},
            totalSize: 0,
            hasMetadata: 0,
        };
    }

    const files = processResult.files;
    const categories = {};
    let totalSize = 0;
    let hasMetadata = 0;

    files.forEach(file => {
        if (file.success) {
            // Count by category
            categories[file.category] = (categories[file.category] || 0) + 1;
            totalSize += file.fileSize;
            if (file.metadataExtracted) {
                hasMetadata++;
            }
        }
    });

    return {
        total: files.length,
        successful: processResult.successfulFiles,
        failed: processResult.failedFiles,
        categories,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        hasMetadata,
        metadataPercentage: processResult.successfulFiles > 0
            ? ((hasMetadata / processResult.successfulFiles) * 100).toFixed(1)
            : 0,
    };
}

/**
 * Export configuration for external use
 */
export const config = {
    USE_MOCK,
    MAX_FILE_SIZE,
    MAX_TOTAL_SIZE,
    SUPPORTED_TYPES,
};
