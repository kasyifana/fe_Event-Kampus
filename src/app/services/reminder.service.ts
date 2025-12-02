import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ManualReminderPayload {
    event_id: string;
    template_id: string;
    extra_message?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ReminderService {
    private readonly baseUrl = `${environment.apiBaseUrl}/reminders`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    // Kirim reminder manual
    sendManualReminder(payload: ManualReminderPayload): Observable<any> {
        const headers = this.getAuthHeaders();
        // Endpoint yang benar: POST /api/v1/events/{id}/reminders
        const url = `${environment.apiBaseUrl}/events/${payload.event_id}/reminders`;

        console.log('[ReminderService] POST manual reminder', url, payload);

        // Payload mungkin perlu disesuaikan jika backend butuh body tertentu
        // Tapi dari curl user: -X POST ...reminders (tanpa body khusus selain auth)
        // Kita kirim payload.extra_message jika ada
        const body = payload.extra_message ? { message: payload.extra_message } : {};

        return this.http.post(url, body, { headers });
    }

    // Update status auto reminder (ON/OFF)
    updateAutoReminder(id: string, active: boolean): Observable<any> {
        const headers = this.getAuthHeaders();
        const url = `${this.baseUrl}/auto/${id}`;
        const payload = { active };

        console.log('[ReminderService] PUT auto reminder', url, payload);

        return this.http.put(url, payload, { headers });
    }
}
