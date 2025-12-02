// src/app/models/event.model.ts

/**
 * Event category types based on API spec
 */
export type EventCategory = 'seminar' | 'workshop' | 'lomba' | 'konser';

/**
 * Event type (venue) based on API spec
 */
export type EventType = 'online' | 'offline';

/**
 * Event status lifecycle
 */
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

/**
 * Full Event entity from backend
 */
export interface Event {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    event_type: EventType;
    status: EventStatus;

    location?: string;
    zoom_link?: string;
    poster_url?: string;

    start_date: string; // ISO datetime
    end_date: string; // ISO datetime
    registration_deadline: string; // ISO datetime

    max_participants: number;
    current_participants?: number;
    is_uii_only: boolean;

    organizer_id: string;
    organizer_name?: string;
    organization_name?: string;

    created_at: string;
    updated_at: string;
}

/**
 * Payload for creating a new event
 * POST /events
 */
export interface CreateEventRequest {
    title: string;
    description: string;
    category: EventCategory;
    event_type: EventType;
    location?: string;
    zoom_link?: string;
    start_date: string; // ISO format
    end_date: string; // ISO format
    registration_deadline: string; // ISO format
    max_participants: number;
    is_uii_only: boolean;
    status: 'draft' | 'published';
}

/**
 * Payload for updating an event
 * PUT /events/{id}
 */
export interface UpdateEventRequest {
    title?: string;
    description?: string;
    category?: EventCategory;
    event_type?: EventType;
    location?: string;
    zoom_link?: string;
    start_date?: string;
    end_date?: string;
    registration_deadline?: string;
    max_participants?: number;
    is_uii_only?: boolean;
    status?: EventStatus;
}

/**
 * Query filters for GET /events
 */
export interface EventFilters {
    category?: EventCategory;
    status?: EventStatus;
    event_type?: EventType;
    search?: string;
}

/**
 * Event with registration status for current user
 */
export interface EventWithRegistration extends Event {
    is_registered?: boolean;
    registration_id?: string;
    registration_status?: string;
}
