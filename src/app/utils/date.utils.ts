// src/app/utils/date.utils.ts

/**
 * Date utility functions for formatting and validation
 */

/**
 * Format date to display format: "01 Jan 2024"
 */
export function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    };

    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format date with time: "01 Jan 2024, 14:30"
 */
export function formatDateTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format time only: "14:30"
 */
export function formatTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Convert date to ISO string for API
 */
export function toISOString(date: Date | string): string {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toISOString();
}

/**
 * Convert datetime-local input value to ISO string
 */
export function datetimeLocalToISO(datetimeLocal: string): string {
    if (!datetimeLocal) return '';
    const date = new Date(datetimeLocal);
    return date.toISOString();
}

/**
 * Convert ISO string to datetime-local input value
 */
export function isoToDatetimeLocal(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date > new Date();
}

/**
 * Check if event is happening now
 */
export function isOngoing(startDate: string, endDate: string): boolean {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
}

/**
 * Get relative time: "2 hours ago", "in 3 days"
 */
export function getRelativeTime(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (Math.abs(diffMins) < 60) {
        return diffMins > 0 ? `dalam ${diffMins} menit` : `${Math.abs(diffMins)} menit yang lalu`;
    } else if (Math.abs(diffHours) < 24) {
        return diffHours > 0 ? `dalam ${diffHours} jam` : `${Math.abs(diffHours)} jam yang lalu`;
    } else {
        return diffDays > 0 ? `dalam ${diffDays} hari` : `${Math.abs(diffDays)} hari yang lalu`;
    }
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
}
