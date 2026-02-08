import * as exifr from 'exifr';
import { getDocument } from 'pdfjs-dist';

/**
 * Metadata Extractor Utility
 * Extracts metadata from various file types (images, videos, audio, PDFs)
 * for forensic analysis purposes.
 */

/**
 * Extract EXIF metadata from image files
 * @param {File} file - Image file object
 * @returns {Promise<Object>} Extracted metadata
 */
export async function extractImageMetadata(file) {
  try {
    const exifData = await exifr.parse(file, {
      gps: true,
      exif: true,
      iptc: true,
      ifd0: true,
      ifd1: true,
      xmp: true,
    });

    if (!exifData) {
      return {
        success: false,
        error: 'No EXIF data found',
        metadata: {},
      };
    }

    // Extract relevant fields
    const metadata = {
      // Camera information
      make: exifData.Make || null,
      model: exifData.Model || null,
      software: exifData.Software || null,
      
      // Timestamp information
      dateTime: exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate || null,
      dateTimeDigitized: exifData.DateTimeDigitized || null,
      modifyDate: exifData.ModifyDate || null,
      
      // GPS information
      gps: exifData.latitude && exifData.longitude ? {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        altitude: exifData.GPSAltitude || null,
        timestamp: exifData.GPSDateStamp || null,
      } : null,
      
      // Image settings
      iso: exifData.ISO || null,
      fNumber: exifData.FNumber || null,
      exposureTime: exifData.ExposureTime || null,
      focalLength: exifData.FocalLength || null,
      
      // Dimensions
      width: exifData.ImageWidth || exifData.ExifImageWidth || null,
      height: exifData.ImageHeight || exifData.ExifImageHeight || null,
      
      // Orientation
      orientation: exifData.Orientation || null,
      
      // Additional forensic data
      lensModel: exifData.LensModel || null,
      flash: exifData.Flash || null,
      whiteBalance: exifData.WhiteBalance || null,
    };

    return {
      success: true,
      metadata,
      rawExif: exifData, // Keep raw data for advanced analysis
    };
  } catch (error) {
    console.error('Error extracting image metadata:', error);
    return {
      success: false,
      error: error.message,
      metadata: {},
    };
  }
}

/**
 * Extract metadata from video files
 * @param {File} file - Video file object
 * @returns {Promise<Object>} Extracted metadata
 */
export async function extractVideoMetadata(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        
        const metadata = {
          duration: video.duration || null,
          width: video.videoWidth || null,
          height: video.videoHeight || null,
          // File creation date (from File object)
          lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
        };

        resolve({
          success: true,
          metadata,
        });
      };

      video.onerror = function() {
        window.URL.revokeObjectURL(video.src);
        resolve({
          success: false,
          error: 'Failed to load video metadata',
          metadata: {},
        });
      };

      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error extracting video metadata:', error);
      resolve({
        success: false,
        error: error.message,
        metadata: {},
      });
    }
  });
}

/**
 * Extract metadata from audio files
 * @param {File} file - Audio file object
 * @returns {Promise<Object>} Extracted metadata
 */
export async function extractAudioMetadata(file) {
  return new Promise((resolve) => {
    try {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      audio.onloadedmetadata = function() {
        window.URL.revokeObjectURL(audio.src);
        
        const metadata = {
          duration: audio.duration || null,
          // File creation date (from File object)
          lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
        };

        resolve({
          success: true,
          metadata,
        });
      };

      audio.onerror = function() {
        window.URL.revokeObjectURL(audio.src);
        resolve({
          success: false,
          error: 'Failed to load audio metadata',
          metadata: {},
        });
      };

      audio.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error extracting audio metadata:', error);
      resolve({
        success: false,
        error: error.message,
        metadata: {},
      });
    }
  });
}

/**
 * Extract metadata from PDF files
 * @param {File} file - PDF file object
 * @returns {Promise<Object>} Extracted metadata
 */
export async function extractPDFMetadata(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use pdf.js to extract metadata
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const metadata = await pdf.getMetadata();
    const pageCount = pdf.numPages;

    const extractedMetadata = {
      pageCount,
      title: metadata.info?.Title || null,
      author: metadata.info?.Author || null,
      subject: metadata.info?.Subject || null,
      keywords: metadata.info?.Keywords || null,
      creator: metadata.info?.Creator || null,
      producer: metadata.info?.Producer || null,
      creationDate: metadata.info?.CreationDate || null,
      modificationDate: metadata.info?.ModDate || null,
      // File last modified (from File object)
      lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
    };

    return {
      success: true,
      metadata: extractedMetadata,
      rawMetadata: metadata.info,
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    return {
      success: false,
      error: error.message,
      metadata: {},
    };
  }
}

/**
 * Main metadata extraction function - routes to appropriate extractor
 * @param {File} file - File object to extract metadata from
 * @returns {Promise<Object>} Standardized metadata object
 */
export async function extractMetadata(file) {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // Image files
    if (fileType.startsWith('image/')) {
      return await extractImageMetadata(file);
    }
    
    // Video files
    if (fileType.startsWith('video/')) {
      return await extractVideoMetadata(file);
    }
    
    // Audio files
    if (fileType.startsWith('audio/')) {
      return await extractAudioMetadata(file);
    }
    
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractPDFMetadata(file);
    }

    // Unsupported file type
    return {
      success: false,
      error: `Unsupported file type: ${fileType}`,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      },
    };
  } catch (error) {
    console.error('Error in metadata extraction:', error);
    return {
      success: false,
      error: error.message,
      metadata: {},
    };
  }
}

/**
 * Batch extract metadata from multiple files
 * @param {File[]} files - Array of file objects
 * @returns {Promise<Object[]>} Array of metadata results
 */
export async function extractMetadataBatch(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      const result = await extractMetadata(file);
      return {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ...result,
      };
    })
  );
  
  return results;
}
