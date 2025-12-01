// src/app/services/event.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type EventCategory = 'seminar' | 'workshop' | 'lomba' | 'konser';
export type EventType = 'online' | 'offline';
export type EventStatus =
  | 'draft'
  | 'published'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  event_type: EventType;
  location?: string | null;
  zoom_link?: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: number;
  is_uii_only: boolean;
  status: 'draft' | 'published';
}

export interface EventFilters {
  category?: EventCategory;
  status?: EventStatus;
  event_type?: EventType;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly eventsUrl = `${environment.apiBaseUrl}/events`;
  private readonly registrationsUrl = `${environment.apiBaseUrl}/registrations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // ============= LIST EVENT UMUM =============
  getEvents(filters?: EventFilters): Observable<any> {
    const headers = this.getAuthHeaders();
    let params = new HttpParams();

    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.event_type) params = params.set('event_type', filters.event_type);
    if (filters?.search) params = params.set('search', filters.search);

    console.log('[EventService] GET events', { url: this.eventsUrl, filters });

    return this.http.get(this.eventsUrl, { params, headers });
  }

  // ============= EVENT MILIK ORGANIZER/ADMIN =============
  getMyEvents(): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/my-events`;

    console.log('[EventService] GET my events', url);

    return this.http.get(url, { headers });
  }

  // ============= EVENT YANG DIIKUTI USER =============
  getMyRegisteredEvents(): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.registrationsUrl}/my`;

    console.log('[EventService] GET my registered events', url);

    return this.http.get(url, { headers });
  }

  // ============= LIST PESERTA PER EVENT =============
  /**
   * Sesuai Swagger:
   * GET /events/{id}/registrations
   */
  getRegistrationsByEvent(eventId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${eventId}/registrations`;

    console.log('[EventService] GET event registrations', url);

    return this.http.get(url, { headers });
  }

  // ============= DETAIL EVENT =============
  getEventById(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}`;

    console.log('[EventService] GET event by id', url);

    return this.http.get(url, { headers });
  }

  // ============= BUAT EVENT =============
  createEvent(payload: CreateEventPayload): Observable<any> {
    const headers = this.getAuthHeaders();

    console.log('[EventService] POST create event', this.eventsUrl, payload);

    return this.http.post(this.eventsUrl, payload, { headers });
  }

  // ============= UPDATE EVENT =============
  updateEvent(id: string, payload: Partial<CreateEventPayload>): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}`;

    console.log('[EventService] PUT update event', url, payload);

    return this.http.put(url, payload, { headers });
  }

  // ============= HAPUS EVENT =============
  deleteEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}`;

    console.log('[EventService] DELETE event', url);

    return this.http.delete(url, { headers });
  }

  // ============= UPLOAD POSTER =============
  uploadPoster(id: string, file: File): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}/poster`;

    const formData = new FormData();
    formData.append('poster', file);

    console.log('[EventService] POST upload poster', {
      url,
      fileName: file.name,
    });

    return this.http.post(url, formData, { headers });
  }

  // ============= PUBLISH EVENT =============
  publishEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}/publish`;

    console.log('[EventService] POST publish event', url);

    return this.http.post(url, {}, { headers });
  }

  // ============= DAFTAR KE EVENT =============
  registerToEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.eventsUrl}/${id}/register`;

    console.log('[EventService] POST register to event', url);

    return this.http.post(url, {}, { headers });
  }

  // ============= BATALKAN REGISTRASI =============
  cancelRegistration(registrationId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.registrationsUrl}/${registrationId}`;

    console.log('[EventService] DELETE cancel registration', url);

    return this.http.delete(url, { headers });
  }
}
