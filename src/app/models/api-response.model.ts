// src/app/models/api-response.model.ts

/**
 * Generic API response wrapper
 * Used by all backend endpoints
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Paginated response for list endpoints
 */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Standard error response from API
 */
export interface ApiError {
    success: false;
    message: string;
    error?: string;
    details?: any;
}

/**
 * Common status type used across entities
 */
export type CommonStatus = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
