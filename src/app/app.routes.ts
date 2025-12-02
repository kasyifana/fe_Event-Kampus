import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// USER LAYOUT
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Home } from './pages/home/home';
import { EventSaya } from './pages/event-saya/event-saya';
import { Notifikasi } from './pages/notifikasi/notifikasi';
import { EventDetail } from './pages/detail/detail';
import { WhitelistRequestPage } from './pages/whitelist-request/whitelist-request';

// ADMIN LAYOUT
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { KelolaEvent } from './pages/admin/kelola-event/kelola-event';
import { Peserta } from './pages/admin/peserta/peserta';
import { Reminder } from './pages/admin/reminder/reminder';
import { KelolaOrganisasi } from './pages/admin/kelola-organisasi/kelola-organisasi';

// GUARDS
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Public routes
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Protected user routes
  {
    path: '',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'event-saya', component: EventSaya },
      { path: 'notifikasi', component: Notifikasi },
      { path: 'event/:id', component: EventDetail },
      { path: 'whitelist-request', component: WhitelistRequestPage },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // Admin-only routes
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'kelola-event', component: KelolaEvent },
      { path: 'peserta', component: Peserta },
      { path: 'kelola-organisasi', component: KelolaOrganisasi },
      { path: 'reminder', component: Reminder },
      { path: '', redirectTo: 'kelola-event', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
