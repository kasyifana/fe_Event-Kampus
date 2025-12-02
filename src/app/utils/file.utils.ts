// src/app/utils/file.utils.ts
import { FILE_UPLOAD } from './constants';

/**
 * File handling utility functions
 */

/**
 * Validate file type for images
 */
export function isValidImageFile(file: File): boolean {
    return FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type as any);
}

/**
 * Validate file type for documents (PDF)
 */
export function isValidDocumentFile(file: File): boolean {
    return FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(file.type as any);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeBytes?: number): boolean {
    const maxSize = maxSizeBytes || FILE_UPLOAD.MAX_SIZE_BYTES;
    return file.size <= maxSize;
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Generate full URL for uploaded files
 */
export function getFileUrl(relativePath: string, baseUrl: string): string {
    if (!relativePath) return '';

    // If already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // Remove leading slash from relative path if exists
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

    // Remove trailing slash from base URL if exists
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBase}/${cleanPath}`;
}

/**
 * Generate poster URL for events
 */
export function getPosterUrl(posterPath: string | undefined, baseUrl: string): string {
    if (!posterPath) return '/assets/images/default-poster.jpg';
    return getFileUrl(posterPath, baseUrl);
}

/**
 * Generate document URL for whitelist requests
 */
export function getDocumentUrl(documentPath: string, baseUrl: string): string {
    return getFileUrl(documentPath, baseUrl);
}

/**
 * Validate image file with error message
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!isValidImageFile(file)) {
        return {
            valid: false,
            error: `Tipe file tidak valid. Hanya ${FILE_UPLOAD.ALLOWED_IMAGE_EXTENSIONS.join(', ')} yang diperbolehkan.`,
        };
    }

    if (!isValidFileSize(file)) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar. Maksimal ${FILE_UPLOAD.MAX_SIZE_MB} MB.`,
        };
    }

    return { valid: true };
}

/**
 * Validate document file with error message
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
    if (!isValidDocumentFile(file)) {
        return {
            valid: false,
            error: `Tipe file tidak valid. Hanya ${FILE_UPLOAD.ALLOWED_DOCUMENT_EXTENSIONS.join(', ')} yang diperbolehkan.`,
        };
    }

    if (!isValidFileSize(file)) {
        return {
            valid: false,
            error: `Ukuran file terlalu besar. Maksimal ${FILE_UPLOAD.MAX_SIZE_MB} MB.`,
        };
    }

    return { valid: true };
}

/**
 * Read file as data URL for preview
 */
export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}
