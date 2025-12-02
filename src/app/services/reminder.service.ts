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
        const url = `${this.baseUrl}/manual`;

        console.log('[ReminderService] POST manual reminder', url, payload);

        return this.http.post(url, payload, { headers });
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
