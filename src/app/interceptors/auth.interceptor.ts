// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor for automatic token injection and error handling
 * - Adds Authorization header to all requests
 * - Handles 401 errors by redirecting to login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Get token from auth service
    const token = authService.getToken();

    // Clone request and add Authorization header if token exists
    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    // Handle response and catch errors
    return next(authReq).pipe(
        catchError((error) => {
            // Handle 401 Unauthorized - token expired or invalid
            if (error.status === 401) {
                console.error('[AuthInterceptor] 401 Unauthorized - logging out');
                authService.logout();
                router.navigate(['/login']);
            }

            // Handle 403 Forbidden
            if (error.status === 403) {
                console.error('[AuthInterceptor] 403 Forbidden - access denied');
            }

            return throwError(() => error);
        })
    );
};
