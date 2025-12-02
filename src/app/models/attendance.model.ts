// src/app/models/attendance.model.ts

/**
 * Attendance record entity
 */
export interface Attendance {
    id: string;
    event_id: string;
    user_id: string;
    marked_at: string;
    marked_by: string; // organizer/admin user_id
    notes?: string;

    // Populated user info
    user?: {
        id: string;
        full_name: string;
        email: string;
        phone_number: string;
    };
}

/**
 * Request payload for marking single attendance
 * POST /events/{id}/attendance
 */
export interface MarkAttendanceRequest {
    user_id: string;
    notes?: string;
}

/**
 * Request payload for bulk attendance marking
 * POST /events/{id}/attendance/bulk
 */
export interface BulkMarkAttendanceRequest {
    user_ids: string[];
}

/**
 * Response from bulk attendance marking
 */
export interface BulkAttendanceResponse {
    success_count: number;
    failed_count: number;
    failed_users?: Array<{
        user_id: string;
        reason: string;
    }>;
}

/**
 * Attendance statistics for an event
 */
export interface AttendanceStats {
    event_id: string;
    total_registered: number;
    total_attended: number;
    attendance_rate: number; // percentage
    not_attended: number;
}

/**
 * Attendance list item with user info
 */
export interface AttendanceListItem {
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    registration_status: string;
    attended: boolean;
    attended_at?: string;
    notes?: string;
}
