// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserDetail {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getUserById(id: string): Observable<UserDetail> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserDetail>(`${this.baseUrl}/${id}`, { headers });
  }
}
