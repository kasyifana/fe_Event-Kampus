// src/app/models/registration.model.ts

/**
 * Registration status lifecycle
 */
export type RegistrationStatus = 'pending' | 'confirmed' | 'attended' | 'cancelled';

/**
 * Registration entity from backend
 */
export interface Registration {
    id: string;
    event_id: string;
    user_id: string;
    status: RegistrationStatus;
    registered_at: string;

    // Populated fields
    event?: {
        id: string;
        title: string;
        category: string;
        event_type: string;
        start_date: string;
        end_date: string;
        poster_url?: string;
        location?: string;
        zoom_link?: string;
        organizer_name?: string;
        organization_name?: string;
    };

    user?: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
    };
}

/**
 * Summary of registrations for an event
 */
export interface EventRegistrationSummary {
    event_id: string;
    total_registrations: number;
    confirmed: number;
    attended: number;
    cancelled: number;
    pending: number;
}

/**
 * User's registration list item
 */
export interface MyRegistration {
    id: string;
    event_id: string;
    event_title: string;
    event_category: string;
    event_start_date: string;
    event_poster_url?: string;
    status: RegistrationStatus;
    registered_at: string;
}
