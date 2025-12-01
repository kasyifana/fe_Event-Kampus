// src/app/pages/event-saya/event-saya.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { environment } from '../../../environments/environment';

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
    private eventService: EventService
  ) {}

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

    this.eventService.getMyRegisteredEvents().subscribe({
      next: (res) => {
        const raw = res?.data ?? res ?? [];

        console.log('[EventSaya] my-registrations API raw:', raw);

        if (!Array.isArray(raw)) {
          console.error('[EventSaya] response bukan array:', raw);
          this.errorMessage = 'Format data tidak sesuai.';
          this.isLoading = false;
          return;
        }

        const now = new Date();

        raw.forEach((item: any) => {
          // swagger umumnya: { id: 'reg-id', event: {...}, certificate_url: '...' }
          const registrationId: string | undefined = item?.id;
          const ev = item?.event ?? item;

          if (!ev || !registrationId) return;

          // ========== TANGGAL ==========
          const start = ev.start_date ? new Date(ev.start_date) : new Date();
          const end   = ev.end_date   ? new Date(ev.end_date)   : start;

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
          // coba baca dari beberapa kemungkinan field
          let img: string =
            ev.poster_url ||
            ev.poster ||
            ev.posterUrl ||
            item.poster_url ||
            item.poster ||
            '';

          // fallback kalau benar-benar kosong
          if (!img) {
            img = 'assets/events/default.png';
          } else if (
            // kalau BUKAN URL penuh & BUKAN asset Angular,
            // baru kita tempel fileBaseUrl (backend)
            !img.startsWith('http') &&
            !img.startsWith('assets/')
          ) {
            if (img.startsWith('/')) {
              // contoh: "/files/xxx.png"
              img = environment.fileBaseUrl + img;
            } else {
              // contoh: "files/xxx.png"
              img = environment.fileBaseUrl + '/' + img;
            }
          }

          // ========== KATEGORI ==========
          const categoryLabel = this.mapCategoryLabel(ev.category);

          // ========== STATUS ==========
          const isPast = end.getTime() < now.getTime();
          const isStatusFinished =
            ev.status === 'completed' || ev.status === 'cancelled';

          const status: 'upcoming' | 'done' =
            isPast || isStatusFinished ? 'done' : 'upcoming';

          const mapped: EventItem = {
            id: ev.id,
            registrationId,
            category: categoryLabel,
            title: ev.title,
            organizer: ev.organizer_name || 'Penyelenggara',
            date: dateStr,
            time: timeStr,
            place,
            posterUrl: img,
            status,
            certificateUrl: item?.certificate_url ?? null,
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
        console.error('[EventSaya] gagal load event saya:', err);

        switch (err.status) {
          case 401:
            this.errorMessage = 'Sesi login habis. Silakan login kembali.';
            break;
          case 403:
            this.errorMessage =
              'Kamu tidak punya izin untuk mengakses data event ini.';
            break;
          default:
            this.errorMessage =
              err.error?.error ||
              err.error?.message ||
              'Gagal memuat event yang kamu ikuti.';
            break;
        }

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

    this.eventService.cancelRegistration(eventItem.registrationId).subscribe({
      next: () => {
        alert('Pendaftaran berhasil dibatalkan.');
        this.loadMyEvents();
      },
      error: (err: any) => {
        console.error('[EventSaya] cancel failed:', err);
        const msg =
          err.error?.error ||
          err.error?.message ||
          'Gagal membatalkan pendaftaran.';
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
