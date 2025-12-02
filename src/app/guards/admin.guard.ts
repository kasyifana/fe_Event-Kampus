// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { WhitelistService } from '../services/whitelist.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Admin Guard - Protects routes that require admin or approved organizer role
 * Redirects to home if user is not authorized
 */
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const whitelistService = inject(WhitelistService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        console.warn('[AdminGuard] User not authenticated, redirecting to login');
        router.navigate(['/login']);
        return false;
    }

    // If already admin, allow immediately
    if (authService.isAdmin()) {
        return true;
    }

    // Check if user is approved organizer
    return whitelistService.getMyRequest().pipe(
        map((response) => {
            const request = response.data;

            if (request && request.status === 'approved') {
                console.log('[AdminGuard] User is approved organizer, allowing access');
                return true;
            }

            console.warn('[AdminGuard] User is not admin or approved organizer, redirecting to home');
            router.navigate(['/home']);
            return false;
        }),
        catchError(() => {
            // No whitelist request, not authorized
            console.warn('[AdminGuard] No whitelist request, redirecting to home');
            router.navigate(['/home']);
            return of(false);
        })
    );
};
