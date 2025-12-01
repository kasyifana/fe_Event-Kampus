// src/app/pages/admin/kelola-event/kelola-event.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  EventService,
  CreateEventPayload,
  EventCategory,
  EventType,
} from '../../../services/event.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-kelola-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './kelola-event.html',
  styleUrls: ['./kelola-event.css'],
})
export class KelolaEvent implements OnInit {
  events: any[] = [];
  showCreateModal = false;

  // MODE: create / edit
  isEditMode = false;
  editingEventId: string | null = null;

  // dropdown
  categories: EventCategory[] = ['seminar', 'workshop', 'lomba', 'konser'];
  eventTypes: EventType[] = ['online', 'offline'];

  // search di atas tabel
  searchKeyword = '';

  // Form state
  form = {
    title: '',
    description: '',
    category: 'seminar' as EventCategory,
    event_type: 'offline' as EventType,
    location: '',
    zoom_link: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    registration_date: '',
    registration_time: '',
    max_participants: 1,
    is_uii_only: false,
  };

  posterFile: File | null = null;

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadMyEvents();
  }

  // ==========================
  // LOAD EVENT MILIK ORGANIZER
  // ==========================
  loadMyEvents() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventService.getMyEvents().subscribe({
      next: (res) => {
        this.events = res?.data || [];
        console.log('[KelolaEvent] My events:', this.events);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[KelolaEvent] Gagal load event:', err);
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          'Gagal memuat daftar event.';
        this.isLoading = false;
      },
    });
  }

  // list yang sudah difilter search
  get filteredEvents() {
    const kw = this.searchKeyword.trim().toLowerCase();
    if (!kw) return this.events;

    return this.events.filter((ev) => {
      const title = (ev.title || '').toLowerCase();
      const org = (ev.organizer_name || '').toLowerCase();
      return title.includes(kw) || org.includes(kw);
    });
  }

  // ==========================
  // STAT DI KARTU ATAS
  // ==========================
  get totalEvents(): number {
    return this.events.length;
  }

  get activeEventsCount(): number {
    return this.events.filter(
      (ev) => ev.status === 'published' || ev.status === 'ongoing'
    ).length;
  }

  get totalParticipants(): number {
    return this.events.reduce(
      (sum, ev) => sum + (ev.current_participants || 0),
      0
    );
  }

  get attendancePercent(): number {
    const totalMax = this.events.reduce(
      (sum, ev) => sum + (ev.max_participants || 0),
      0
    );
    if (!totalMax) return 0;
    return Math.round((this.totalParticipants / totalMax) * 100);
  }

  // ==========================
  // MODAL
  // ==========================
  openCreateModal() {
    this.resetForm();
    this.isEditMode = false;
    this.editingEventId = null;
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  resetForm() {
    this.form = {
      title: '',
      description: '',
      category: 'seminar',
      event_type: 'offline',
      location: '',
      zoom_link: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      registration_date: '',
      registration_time: '',
      max_participants: 1,
      is_uii_only: false,
    };
    this.posterFile = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ==========================
  // UPLOAD POSTER
  // ==========================
  onPosterSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.posterFile = input.files[0];
      console.log('[KelolaEvent] Poster dipilih:', this.posterFile.name);
    }
  }

  // Helper: gabung date + time ke ISO string
  private buildISO(date: string, time: string): string {
    if (!date || !time) return '';
    const d = new Date(`${date}T${time}:00`);
    return d.toISOString();
  }

  // Helper: bentuk payload sesuai backend
  private buildPayload(): CreateEventPayload {
    const startISO = this.buildISO(this.form.start_date, this.form.start_time);
    const endISO = this.buildISO(this.form.end_date, this.form.end_time);
    const regISO = this.buildISO(
      this.form.registration_date,
      this.form.registration_time
    );

    return {
      title: this.form.title,
      description: this.form.description,
      category: this.form.category,
      event_type: this.form.event_type,
      location:
        this.form.event_type === 'offline' ? this.form.location : null,
      zoom_link:
        this.form.event_type === 'online' ? this.form.zoom_link : null,
      start_date: startISO,
      end_date: endISO,
      registration_deadline: regISO,
      max_participants: this.form.max_participants,
      is_uii_only: this.form.is_uii_only,
      status: 'draft', // default untuk create
    };
  }

  // ==========================
  // CREATE EVENT
  // ==========================
  submitNewEvent(formRef: NgForm) {
    if (formRef.invalid) {
      this.errorMessage = 'Form belum lengkap, cek kembali isianmu.';
      return;
    }

    if (this.form.max_participants <= 0) {
      this.errorMessage = 'Jumlah maksimal peserta harus lebih dari 0.';
      return;
    }

    if (
      this.form.event_type === 'offline' &&
      (!this.form.location || this.form.location.trim() === '')
    ) {
      this.errorMessage = 'Lokasi wajib diisi untuk event offline.';
      return;
    }

    if (
      this.form.event_type === 'online' &&
      (!this.form.zoom_link || this.form.zoom_link.trim() === '')
    ) {
      this.errorMessage = 'Link Zoom wajib diisi untuk event online.';
      return;
    }

    const startISO = this.buildISO(this.form.start_date, this.form.start_time);
    const endISO = this.buildISO(this.form.end_date, this.form.end_time);
    const regISO = this.buildISO(
      this.form.registration_date,
      this.form.registration_time
    );

    if (!startISO || !endISO || !regISO) {
      this.errorMessage =
        'Tanggal & jam mulai/selesai dan batas pendaftaran wajib diisi.';
      return;
    }

    const start = new Date(startISO);
    const end = new Date(endISO);
    const reg = new Date(regISO);

    if (end <= start) {
      this.errorMessage =
        'Tanggal/jam selesai harus setelah tanggal/jam mulai.';
      return;
    }

    if (reg > start) {
      this.errorMessage =
        'Batas pendaftaran harus sebelum tanggal mulai event.';
      return;
    }

    const payload = this.buildPayload();
    console.log('[KelolaEvent] CREATE EVENT payload:', payload);

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventService.createEvent(payload).subscribe({
      next: (res: any) => {
        console.log('[KelolaEvent] Event dibuat:', res);
        const eventId = res?.data?.id;

        if (eventId && this.posterFile) {
          this.eventService.uploadPoster(eventId, this.posterFile).subscribe({
            next: () => console.log('[KelolaEvent] Poster uploaded!'),
            error: (err) =>
              console.error('[KelolaEvent] Gagal upload poster:', err),
          });
        }

        this.isLoading = false;
        this.successMessage = 'Event berhasil dibuat sebagai draft.';
        this.loadMyEvents();
        this.closeCreateModal();
      },
      error: (err) => {
        console.error('[KelolaEvent] Gagal membuat event:', err);
        console.log(
          '[KelolaEvent] Detail error dari backend:',
          err.error
        );
        this.isLoading = false;

        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          `Gagal membuat event (status ${err.status}).`;
      },
    });
  }

  // ==========================
  // PUBLISH EVENT
  // ==========================
  publishEvent(id: string) {
    if (!id) return;

    if (!confirm('Yakin ingin mem-publish event ini?')) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('[KelolaEvent] PUBLISH event id:', id);

    this.eventService.publishEvent(id).subscribe({
      next: (res) => {
        console.log('[KelolaEvent] Event published:', res);
        this.successMessage = 'Event berhasil dipublish.';
        this.isLoading = false;
        this.loadMyEvents(); // refresh status di tabel
      },
      error: (err) => {
        console.error('[KelolaEvent] Gagal publish event:', err);
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          `Gagal publish event (status ${err.status}).`;
        this.isLoading = false;
      },
    });
  }

  // ==========================
  // HELPER UNTUK TABEL
  // ==========================
  getQuotaPercent(ev: any): number {
    const max = ev.max_participants || 0;
    const current = ev.current_participants || 0;
    if (!max) return 0;
    return Math.min(100, Math.round((current / max) * 100));
  }

  getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'seminar':
        return 'Seminar';
      case 'workshop':
        return 'Workshop';
      case 'lomba':
        return 'Lomba';
      case 'konser':
        return 'Konser';
      default:
        return cat;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'published':
      case 'ongoing':
        return 'Aktif';
      case 'draft':
        return 'Tidak Aktif';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'published':
      case 'ongoing':
        return 'status-badge status-aktif';
      case 'draft':
        return 'status-badge status-tidak-aktif';
      case 'completed':
        return 'status-badge status-selesai';
      case 'cancelled':
        return 'status-badge status-batal';
      default:
        return 'status-badge';
    }
  }

  // ==========================
  // AKSI IKON (R & U & D)
  // ==========================
  viewEvent(ev: any) {
    console.log('[KelolaEvent] View event:', ev);
  }

  editEvent(ev: any) {
    console.log('[KelolaEvent] Edit event:', ev);

    this.isEditMode = true;
    this.editingEventId = ev.id || null;

    const start = this.splitISO(ev.start_date);
    const end = this.splitISO(ev.end_date);
    const reg = this.splitISO(ev.registration_deadline);

    this.form = {
      title: ev.title || '',
      description: ev.description || '',
      category: (ev.category as EventCategory) || 'seminar',
      event_type: (ev.event_type as EventType) || 'offline',
      location: ev.location || '',
      zoom_link: ev.zoom_link || '',
      start_date: start.date,
      start_time: start.time,
      end_date: end.date,
      end_time: end.time,
      registration_date: reg.date,
      registration_time: reg.time,
      max_participants: ev.max_participants || 1,
      is_uii_only: !!ev.is_uii_only,
    };

    this.posterFile = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.showCreateModal = true;
  }

  deleteEvent(id: string) {
    if (!id) return;
    if (!confirm('Yakin ingin menghapus event ini?')) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('[KelolaEvent] DELETE event id:', id);

    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        console.log('[KelolaEvent] Event dihapus:', id);
        this.successMessage = 'Event berhasil dihapus.';
        this.isLoading = false;
        this.loadMyEvents(); // refresh list setelah hapus
      },
      error: (err) => {
        console.error('[KelolaEvent] Gagal hapus event:', err);
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          `Gagal menghapus event (status ${err.status}).`;
        this.isLoading = false;
      },
    });
  }

  onSearchEnter() {
    console.log('[KelolaEvent] Search:', this.searchKeyword);
  }

  // ==========================
  // UTIL: split ISO ke date + time
  // ==========================
  private splitISO(
    iso: string | null | undefined
  ): { date: string; time: string } {
    if (!iso) return { date: '', time: '' };
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: '', time: '' };

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}:${mi}`,
    };
  }
}
