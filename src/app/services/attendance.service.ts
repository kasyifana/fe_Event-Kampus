// src/app/services/attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
    Attendance,
    MarkAttendanceRequest,
    BulkMarkAttendanceRequest,
    BulkAttendanceResponse,
    AttendanceStats,
    AttendanceListItem,
} from '../models/attendance.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class AttendanceService {
    private readonly eventsUrl = `${environment.apiBaseUrl}/events`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    /**
     * Get attendance list for an event
     * GET /events/{id}/attendance
     */
    getEventAttendance(eventId: string): Observable<ApiResponse<Attendance[]>> {
        const headers = this.getAuthHeaders();
        const url = `${this.eventsUrl}/${eventId}/attendance`;

        console.log('[AttendanceService] GET event attendance', url);

        return this.http.get<ApiResponse<Attendance[]>>(url, { headers });
    }

    /**
     * Mark single user attendance
     * POST /events/{id}/attendance
     */
    markAttendance(
        eventId: string,
        request: MarkAttendanceRequest
    ): Observable<ApiResponse<Attendance>> {
        const headers = this.getAuthHeaders();
        const url = `${this.eventsUrl}/${eventId}/attendance`;

        console.log('[AttendanceService] POST mark attendance', { url, eventId, request });

        return this.http.post<ApiResponse<Attendance>>(url, request, { headers });
    }

    /**
     * Mark bulk attendance for multiple users
     * POST /events/{id}/attendance/bulk
     */
    markBulkAttendance(
        eventId: string,
        request: BulkMarkAttendanceRequest
    ): Observable<ApiResponse<BulkAttendanceResponse>> {
        const headers = this.getAuthHeaders();
        const url = `${this.eventsUrl}/${eventId}/attendance/bulk`;

        console.log('[AttendanceService] POST bulk attendance', {
            url,
            eventId,
            userCount: request.user_ids.length,
        });

        return this.http.post<ApiResponse<BulkAttendanceResponse>>(url, request, { headers });
    }

    /**
     * Get attendance statistics for an event
     * Computed from attendance list
     */
    getAttendanceStats(eventId: string): Observable<AttendanceStats> {
        return this.getEventAttendance(eventId).pipe(
            map((response) => {
                const attendances = response.data;
                const totalAttended = attendances.length;

                // This is a simplified version - ideally backend provides total registered
                const stats: AttendanceStats = {
                    event_id: eventId,
                    total_registered: totalAttended, // Would need registrations count
                    total_attended: totalAttended,
                    attendance_rate: 0,
                    not_attended: 0,
                };

                if (stats.total_registered > 0) {
                    stats.attendance_rate = (stats.total_attended / stats.total_registered) * 100;
                    stats.not_attended = stats.total_registered - stats.total_attended;
                }

                return stats;
            })
        );
    }

    /**
     * Helper: Check if user attended an event
     */
    hasUserAttended(eventId: string, userId: string): Observable<boolean> {
        return this.getEventAttendance(eventId).pipe(
            map((response) => {
                const attendances = response.data;
                return attendances.some((a) => a.user_id === userId);
            })
        );
    }
}
