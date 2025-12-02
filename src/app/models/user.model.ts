// src/app/models/user.model.ts

/**
 * User role types
 */
export type UserRole = 'mahasiswa' | 'organisasi' | 'admin';

/**
 * User entity from backend
 */
export interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    role: UserRole;
    is_uii_civitas: boolean;
    is_approved: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * User profile display information
 */
export interface UserProfile extends User {
    organization_name?: string;
    total_events_created?: number;
    total_events_attended?: number;
}
