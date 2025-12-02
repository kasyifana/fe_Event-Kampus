// src/app/services/whitelist.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
    WhitelistRequest,
    CreateWhitelistRequestData,
    ReviewWhitelistRequest,
    WhitelistStatus,
    WhitelistSummary,
} from '../models/whitelist.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
    providedIn: 'root',
})
export class WhitelistService {
    private readonly baseUrl = `${environment.apiBaseUrl}/whitelist`;

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
     * Submit whitelist request to become organizer
     * POST /whitelist/request (multipart/form-data)
     */
    submitRequest(data: CreateWhitelistRequestData): Observable<ApiResponse<WhitelistRequest>> {
        const headers = this.getAuthHeaders();
        const formData = new FormData();
        formData.append('organization_name', data.organization_name);
        formData.append('document', data.document);

        const url = `${this.baseUrl}/request`;
        console.log('[WhitelistService] POST submit request', { url, organization: data.organization_name });

        return this.http.post<ApiResponse<WhitelistRequest>>(url, formData, { headers });
    }

    /**
     * Get current user's whitelist request
     * GET /whitelist/my-request
     */
    getMyRequest(): Observable<ApiResponse<WhitelistRequest>> {
        const headers = this.getAuthHeaders();
        const url = `${this.baseUrl}/my-request`;

        console.log('[WhitelistService] GET my request', url);

        return this.http.get<ApiResponse<WhitelistRequest>>(url, { headers });
    }

    /**
     * Get all whitelist requests (admin only)
     * GET /whitelist/requests?status=...
     */
    getAllRequests(status?: WhitelistStatus): Observable<ApiResponse<WhitelistRequest[]>> {
        const headers = this.getAuthHeaders();
        const url = `${this.baseUrl}/requests`;
        const params: any = {};

        if (status) {
            params.status = status;
        }

        console.log('[WhitelistService] GET all requests', { url, status });

        return this.http.get<ApiResponse<WhitelistRequest[]>>(url, { headers, params });
    }

    /**
     * Review whitelist request (admin only)
     * PATCH /whitelist/{id}/review
     */
    reviewRequest(
        requestId: string,
        review: ReviewWhitelistRequest
    ): Observable<ApiResponse<WhitelistRequest>> {
        const headers = this.getAuthHeaders();
        const url = `${this.baseUrl}/${requestId}/review`;

        console.log('[WhitelistService] PATCH review request', { url, requestId, review });

        return this.http.patch<ApiResponse<WhitelistRequest>>(url, review, { headers });
    }

    /**
     * Helper: Get summary statistics
     */
    getSummary(): Observable<WhitelistSummary> {
        // This would call a dedicated endpoint if available, or compute from getAllRequests
        return new Observable((observer) => {
            this.getAllRequests().subscribe({
                next: (response) => {
                    const requests = response.data;
                    const summary: WhitelistSummary = {
                        total: requests.length,
                        pending: requests.filter((r) => r.status === 'pending').length,
                        approved: requests.filter((r) => r.status === 'approved').length,
                        rejected: requests.filter((r) => r.status === 'rejected').length,
                    };
                    observer.next(summary);
                    observer.complete();
                },
                error: (err) => observer.error(err),
            });
        });
    }
}
