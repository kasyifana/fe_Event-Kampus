// src/app/services/registration.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Registration, MyRegistration, EventRegistrationSummary } from '../models/registration.model';
import { ApiResponse } from '../models/api-response.model';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RegistrationService {
    private readonly eventsUrl = `${environment.apiBaseUrl}/events`;
    private readonly registrationsUrl = `${environment.apiBaseUrl}/registrations`;

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
     * Register current user to an event
     * POST /events/{id}/register
     */
    registerToEvent(eventId: string): Observable<ApiResponse<Registration>> {
        const headers = this.getAuthHeaders();
        const url = `${this.eventsUrl}/${eventId}/register`;

        console.log('[RegistrationService] POST register to event', url);

        return this.http.post<ApiResponse<Registration>>(url, {}, { headers });
    }

    /**
     * Cancel/delete a registration
     * DELETE /registrations/{id}
     */
    cancelRegistration(registrationId: string): Observable<ApiResponse<void>> {
        const headers = this.getAuthHeaders();
        const url = `${this.registrationsUrl}/${registrationId}`;

        console.log('[RegistrationService] DELETE cancel registration', url);

        return this.http.delete<ApiResponse<void>>(url, { headers });
    }

    /**
     * Get current user's registrations
     * GET /registrations/my
     */
    getMyRegistrations(): Observable<ApiResponse<Registration[]>> {
        const headers = this.getAuthHeaders();
        const url = `${this.registrationsUrl}/my`;

        console.log('[RegistrationService] GET my registrations', url);

        return this.http.get<ApiResponse<Registration[]>>(url, { headers });
    }

    /**
     * Get all registrations for a specific event (organizer only)
     * GET /events/{id}/registrations
     */
    getEventRegistrations(eventId: string): Observable<ApiResponse<Registration[]>> {
        const headers = this.getAuthHeaders();
        const url = `${this.eventsUrl}/${eventId}/registrations`;

        console.log('[RegistrationService] GET event registrations', url);

        return this.http.get<ApiResponse<Registration[]>>(url, { headers });
    }

    /**
     * Helper: Get registration summary for an event
     */
    getEventRegistrationSummary(eventId: string): Observable<EventRegistrationSummary> {
        return this.getEventRegistrations(eventId).pipe(
            map((response) => {
                const registrations = response.data;
                const summary: EventRegistrationSummary = {
                    event_id: eventId,
                    total_registrations: registrations.length,
                    confirmed: registrations.filter((r) => r.status === 'confirmed').length,
                    attended: registrations.filter((r) => r.status === 'attended').length,
                    cancelled: registrations.filter((r) => r.status === 'cancelled').length,
                    pending: registrations.filter((r) => r.status === 'pending').length,
                };
                return summary;
            })
        );
    }

    /**
     * Helper: Check if user is registered for an event
     */
    isUserRegistered(eventId: string): Observable<boolean> {
        return this.getMyRegistrations().pipe(
            map((response) => {
                const registrations = response.data;
                return registrations.some(
                    (r) => r.event_id === eventId && r.status !== 'cancelled'
                );
            })
        );
    }

    /**
     * Helper: Get user's registration for a specific event
     */
    getUserRegistrationForEvent(eventId: string): Observable<Registration | null> {
        return this.getMyRegistrations().pipe(
            map((response) => {
                const registrations = response.data;
                const reg = registrations.find(
                    (r) => r.event_id === eventId && r.status !== 'cancelled'
                );
                return reg || null;
            })
        );
    }
}
