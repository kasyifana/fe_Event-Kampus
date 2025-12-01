import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// USER LAYOUT
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { Home } from './pages/home/home';
import { EventSaya } from './pages/event-saya/event-saya';
import { Notifikasi } from './pages/notifikasi/notifikasi';
import { EventDetail } from './pages/detail/detail';

// ADMIN LAYOUT
import { AdminLayout } from './layouts/admin-layout/admin-layout';
import { KelolaEvent } from './pages/admin/kelola-event/kelola-event';
import { Peserta } from './pages/admin/peserta/peserta';
import { Reminder } from './pages/admin/reminder/reminder';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  {
    path: '',
    component: DashboardLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'event-saya', component: EventSaya },
      { path: 'notifikasi', component: Notifikasi },
      { path: 'event/:id', component: EventDetail },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  {
  path: 'admin',
  component: AdminLayout,
  children: [
    { path: 'kelola-event', component: KelolaEvent },
    { path: 'peserta', component: Peserta },        // tanpa id → halaman kosong
    
    { path: 'reminder', component: Reminder },
    { path: '', redirectTo: 'kelola-event', pathMatch: 'full' },
  ],
},

  { path: '**', redirectTo: 'login' },
];
