// src/app/guards/organizer.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Organizer Guard - Protects routes that require organizer role
 * Redirects to home if user is not an approved organizer
 */
export const organizerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        console.warn('[OrganizerGuard] User not authenticated, redirecting to login');
        router.navigate(['/login']);
        return false;
    }

    const user = authService.getUser();
    const isOrganizer = user?.role === 'organisasi' && user?.is_approved === true;

    if (isOrganizer || authService.isAdmin()) {
        return true;
    }

    console.warn('[OrganizerGuard] User is not an approved organizer, redirecting to home');
    router.navigate(['/home']);
    return false;
};
