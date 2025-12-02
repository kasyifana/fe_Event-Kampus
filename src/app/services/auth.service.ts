// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ==== REQUEST ====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  phone_number: string;
}

// ==== RESPONSE DARI BACKEND ====
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'mahasiswa' | 'organisasi' | 'admin';
  is_uii_civitas: boolean;
  is_approved: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// wrapper response: { success, message, data: { token, user } }
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Use environment config for API base URL
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
    console.log('[AuthService] Current API Base URL:', this.baseUrl);
  }

  // --------------------------
  // AUTH API
  // --------------------------

  // LOGIN
  login(data: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    const url = `${this.baseUrl}/auth/login`;
    console.log('[AuthService] CALL LOGIN:', url, data);

    return this.http.post<ApiResponse<LoginResponse>>(url, data);
  }

  // REGISTER
  register(data: RegisterRequest): Observable<ApiResponse<LoginResponse>> {
    const url = `${this.baseUrl}/auth/register`;
    console.log('[AuthService] CALL REGISTER:', url, data);

    return this.http.post<ApiResponse<LoginResponse>>(url, data);
  }

  // --------------------------
  // TOKEN & USER HANDLING
  // --------------------------

  saveAuth(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  getUserRole(): User['role'] | null {
    const u = this.getUser();
    return u?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // helper untuk endpoint yang butuh Authorization header
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }
}
