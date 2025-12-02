// src/app/utils/error-handler.utils.ts
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Error handling utility functions
 */

/**
 * Extract user-friendly error message from HTTP error
 */
export function getErrorMessage(error: any): string {
    if (!error) return 'Terjadi kesalahan yang tidak diketahui';

    // HTTP Error Response
    if (error instanceof HttpErrorResponse) {
        // Server returned an error response
        if (error.error) {
            // API response with message
            if (typeof error.error === 'object' && error.error.message) {
                return error.error.message;
            }

            // API response with error field
            if (typeof error.error === 'object' && error.error.error) {
                return error.error.error;
            }

            // Plain text error
            if (typeof error.error === 'string') {
                return error.error;
            }
        }

        // Standard HTTP status messages
        switch (error.status) {
            case 0:
                return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            case 400:
                return 'Permintaan tidak valid. Periksa data yang Anda kirim.';
            case 401:
                return 'Sesi Anda telah berakhir. Silakan login kembali.';
            case 403:
                return 'Anda tidak memiliki akses untuk melakukan aksi ini.';
            case 404:
                return 'Data yang Anda cari tidak ditemukan.';
            case 409:
                return 'Data sudah ada atau terjadi konflik.';
            case 422:
                return 'Data yang Anda kirim tidak valid.';
            case 500:
                return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
            case 503:
                return 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.';
            default:
                return `Terjadi kesalahan: ${error.statusText || 'Unknown error'}`;
        }
    }

    // Error object with message
    if (error.message) {
        return error.message;
    }

    // String error
    if (typeof error === 'string') {
        return error;
    }

    return 'Terjadi kesalahan yang tidak diketahui';
}

/**
 * Extract validation errors from API response
 */
export function getValidationErrors(error: any): Record<string, string[]> | null {
    if (!error || !(error instanceof HttpErrorResponse)) {
        return null;
    }

    if (error.error && typeof error.error === 'object' && error.error.errors) {
        return error.error.errors;
    }

    return null;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 0;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
    return error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
    return error instanceof HttpErrorResponse && error.status === 422;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: any): object {
    if (error instanceof HttpErrorResponse) {
        return {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: getErrorMessage(error),
            error: error.error,
        };
    }

    return {
        message: getErrorMessage(error),
        error: error,
    };
}

/**
 * Handle and log error
 */
export function handleError(error: any, context?: string): void {
    const message = getErrorMessage(error);
    const logData = formatErrorForLogging(error);

    if (context) {
        console.error(`[${context}]`, message, logData);
    } else {
        console.error('Error:', message, logData);
    }
}
