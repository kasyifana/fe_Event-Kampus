// src/app/models/whitelist.model.ts

/**
 * Whitelist request status
 */
export type WhitelistStatus = 'pending' | 'approved' | 'rejected';

/**
 * Whitelist request entity from backend
 */
export interface WhitelistRequest {
    id: string;
    user_id: string;
    organization_name: string;
    document_url: string;
    status: WhitelistStatus;

    created_at: string;      // Added - untuk tanggal submit
    submitted_at: string;
    reviewed_at?: string;
    reviewed_by?: string; // admin user_id
    admin_notes?: string;

    // Flattened user info untuk kemudahan akses
    user_name?: string;
    user_email?: string;

    // Populated user info
    user?: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
    };

    // Populated reviewer info
    reviewer?: {
        id: string;
        full_name: string;
        email: string;
    };
}

/**
 * Form data for submitting whitelist request
 * POST /whitelist/request (multipart/form-data)
 */
export interface CreateWhitelistRequestData {
    organization_name: string;
    document: File; // PDF file
}

/**
 * Payload for reviewing whitelist request
 * PATCH /whitelist/{id}/review
 */
export interface ReviewWhitelistRequest {
    approved: boolean;
    admin_notes?: string;
}

/**
 * Whitelist request summary for admin dashboard
 */
export interface WhitelistSummary {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}
