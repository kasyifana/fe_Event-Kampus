// src/app/utils/constants.ts

/**
 * Application-wide constants
 */

// File upload constraints
export const FILE_UPLOAD = {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,

    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
    ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png'],

    ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
    ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf'],
} as const;

// Date formats
export const DATE_FORMATS = {
    API: "yyyy-MM-dd'T'HH:mm:ss'Z'", // ISO 8601
    DISPLAY: 'dd MMM yyyy',
    DISPLAY_WITH_TIME: 'dd MMM yyyy, HH:mm',
    TIME_ONLY: 'HH:mm',
    INPUT_DATE: 'yyyy-MM-dd',
    INPUT_DATETIME: "yyyy-MM-dd'T'HH:mm",
} as const;

// API endpoints (backup, but primarily using environment)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
    },
    EVENTS: '/events',
    REGISTRATIONS: '/registrations',
    WHITELIST: '/whitelist',
    ATTENDANCE: '/attendance',
} as const;

// Event categories
export const EVENT_CATEGORIES = [
    { value: 'seminar', label: 'Seminar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'lomba', label: 'Lomba' },
    { value: 'konser', label: 'Konser' },
] as const;

// Event types
export const EVENT_TYPES = [
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
] as const;

// Event statuses
export const EVENT_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'published', label: 'Published', color: 'blue' },
    { value: 'ongoing', label: 'Ongoing', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'purple' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

// Registration statuses
export const REGISTRATION_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'attended', label: 'Attended', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

// Whitelist statuses
export const WHITELIST_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
] as const;
