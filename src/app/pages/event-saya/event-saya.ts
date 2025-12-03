import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { EventService } from '../../services/event.service';
import { environment } from '../../../environments/environment';
import { Registration } from '../../models/registration.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface EventItem {
  id: string;               // ID event (buat buka detail)
  registrationId: string;   // ID registrasi (buat cancel)
  category: string;
  title: string;
  organizer: string;
  date: string;
  time: string;
  place: string;
  posterUrl: string;
  status: 'upcoming' | 'done';
  certificateUrl?: string | null;
}

@Component({
  selector: 'app-event-saya',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-saya.html',
  styleUrls: ['./event-saya.css'],
})
export class EventSaya implements OnInit {
  upcomingEvents: EventItem[] = [];
  historyEvents: EventItem[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private registrationService: RegistrationService,
    private eventService: EventService
  ) { }

  ngOnInit(): void {
    this.loadMyEvents();
  }

  // ========================
  // LOAD EVENT YANG DIIKUTI USER / MAHASISWA
  // ========================
  loadMyEvents() {
    this.isLoading = true;
    this.errorMessage = '';

    this.upcomingEvents = [];
    this.historyEvents = [];

    this.registrationService.getMyRegistrations().subscribe({
      next: (res) => {
        // Response wrapper: { success, message, data: Registration[] }
        const registrations = res.data || res || [];

        console.log('[EventSaya] Extracted registrations:', registrations);

        if (!Array.isArray(registrations)) {
          console.error('[EventSaya] response data bukan array:', registrations);
          this.errorMessage = 'Format data tidak sesuai.';
          this.isLoading = false;
          return;
        }

        if (registrations.length === 0) {
          this.isLoading = false;
          return;
        }

        // Create array of observables to fetch event details
        const tasks = registrations.map((reg: Registration) => {
          // If event is already populated, use it (wrapped in observable)
          if (reg.event) {
            return of({ reg, event: reg.event });
          }

          // Otherwise fetch event details
          return this.eventService.getEventById(reg.event_id).pipe(
            map(eventRes => ({ reg, event: eventRes.data || eventRes })),
            catchError(err => {
              console.error(`[EventSaya] Failed to fetch event ${reg.event_id}`, err);
              return of(null); // Return null on error so forkJoin doesn't fail all
            })
          );
        });

        // Execute all requests
        forkJoin(tasks).subscribe({
          next: (results) => {
            const now = new Date();

            results.forEach((item) => {
              if (!item || !item.event) return;

              const { reg, event: ev } = item;
              const registrationId = reg.id;

              // ========== TANGGAL ==========
              const start = ev.start_date ? new Date(ev.start_date) : new Date();
              const end = ev.end_date ? new Date(ev.end_date) : start;

              const dateStr = start.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });

              const timeStr =
                start.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) +
                ' - ' +
                end.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                }) +
                ' WIB';

              // ========== TEMPAT ==========
              const place =
                ev.location ||
                (ev.event_type === 'online' ? 'Online (Zoom)' : '-');

              // ========== POSTER ==========
              let img = ev.poster_url || 'assets/events/default.png';

              if (img.startsWith('http://localhost:8080')) {
                img = img.replace('http://localhost:8080', environment.fileBaseUrl);
              }

              // ========== KATEGORI ==========
              const categoryLabel = this.mapCategoryLabel(ev.category);

              // ========== STATUS ==========
              const isPast = end.getTime() < now.getTime();

              let status: 'upcoming' | 'done' = 'upcoming';

              // Handle 'registered' status from backend log
              const regStatus = reg.status as string;

              if (regStatus === 'cancelled') {
                status = 'done';
              } else if (regStatus === 'attended' || isPast) {
                status = 'done';
              } else {
                // registered, confirmed, pending -> upcoming
                status = 'upcoming';
              }

              const mapped: EventItem = {
                id: ev.id,
                registrationId,
                category: categoryLabel,
                title: ev.title,
                organizer: ev.organizer_name || ev.organization_name || 'Penyelenggara',
                date: dateStr,
                time: timeStr,
                place,
                posterUrl: img,
                status,
                certificateUrl: null,
              };

              if (status === 'upcoming') {
                this.upcomingEvents.push(mapped);
              } else {
                this.historyEvents.push(mapped);
              }
            });

            this.isLoading = false;
          },
          error: (err) => {
            console.error('[EventSaya] Error fetching event details', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('[EventSaya] gagal load event saya:', err);
        this.errorMessage = err.error?.message || 'Gagal memuat event yang kamu ikuti.';
        this.isLoading = false;
      },
    });
  }

  // ========================
  //  STAT KARTU DI ATAS
  // ========================
  get upcomingCount() {
    return this.upcomingEvents.length;
  }

  get doneCount() {
    return this.historyEvents.length;
  }

  // ========================
  //  AKSI TOMBOL
  // ========================
  onViewDetail(eventItem: EventItem) {
    if (!eventItem.id) return;
    this.router.navigate(['/event', eventItem.id]);
  }

  onCancel(eventItem: EventItem) {
    if (!eventItem.registrationId) {
      alert('ID registrasi tidak ditemukan.');
      return;
    }

    if (!confirm(`Batalkan pendaftaran untuk "${eventItem.title}"?`)) return;

    this.registrationService.cancelRegistration(eventItem.registrationId).subscribe({
      next: () => {
        alert('Pendaftaran berhasil dibatalkan.');
        this.loadMyEvents();
      },
      error: (err: any) => {
        console.error('[EventSaya] cancel failed:', err);
        const msg = err.error?.message || 'Gagal membatalkan pendaftaran.';
        alert(msg);
      },
    });
  }

  onOpenCertificate(eventItem: EventItem) {
    if (!eventItem.certificateUrl) {
      alert('Sertifikat belum tersedia.');
      return;
    }
    window.open(eventItem.certificateUrl, '_blank');
  }

  onPosterError(e: EventItem) {
    e.posterUrl = 'assets/events/default.png';
  }

  // ========================
  //  HELPER
  // ========================
  private mapCategoryLabel(cat: string): string {
    const c = (cat || '').toLowerCase();
    switch (c) {
      case 'seminar':
        return 'Seminar';
      case 'workshop':
        return 'Workshop';
      case 'lomba':
        return 'Lomba';
      case 'konser':
        return 'Konser';
      default:
        return cat || '-';
    }
  }
}
