// src/app/pages/detail/detail.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.css'],
})
export class EventDetail implements OnInit {
  isLoading = false;
  errorMessage = '';
  event: any = null;
  posterUrl = '';

  // state buat tombol daftar
  isRegistering = false;
  registerMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Event tidak ditemukan.';
      return;
    }
    this.loadEvent(id);
  }

  loadEvent(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.registerMessage = '';

    this.eventService.getEventById(id).subscribe({
      next: (res) => {
        this.event = res?.data || res;
        this.isLoading = false;

        const raw = this.event?.poster_url as string | undefined;
        if (!raw) {
          this.posterUrl = 'assets/events/default.png';
        } else {
          let img = raw;

          if (img.startsWith('http://localhost:8080')) {
            img = img.replace('http://localhost:8080', environment.fileBaseUrl);
          } else if (img.startsWith('/files/')) {
            img = environment.fileBaseUrl + img;
          }

          this.posterUrl = img;
        }
      },
      error: (err) => {
        console.error('[EventDetail] gagal load:', err);
        this.isLoading = false;
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          'Gagal memuat data event.';
      },
    });
  }

  onPosterError() {
    this.posterUrl = 'assets/events/default.png';
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  get categoryLabel(): string {
    switch (this.event?.category) {
      case 'seminar':
        return 'Seminar';
      case 'workshop':
        return 'Workshop';
      case 'lomba':
        return 'Lomba';
      case 'konser':
        return 'Konser';
      default:
        return this.event?.category || '';
    }
  }

  get formattedDate(): string {
    if (!this.event?.start_date) return '-';
    return new Date(this.event.start_date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  get formattedTime(): string {
    if (!this.event?.start_date || !this.event?.end_date) return '-';
    const start = new Date(this.event.start_date);
    const end = new Date(this.event.end_date);

    const s = start.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const e = end.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${s} - ${e} WIB`;
  }

  get quotaText(): string {
    const current = this.event?.current_participants || 0;
    const max = this.event?.max_participants || 0;
    return `${current}/${max} Peserta`;
  }

  get locationText(): string {
    if (this.event?.location) return this.event.location;
    return this.event?.event_type === 'online' ? 'Online (Zoom)' : '-';
  }

  // ============= DAFTAR EVENT =============
  onRegister() {
  if (!this.event?.id) {
    alert('ID event tidak ditemukan.');
    return;
  }

  // optional: disable tombol jika mau
  // this.isRegistering = true;

  this.eventService.registerToEvent(this.event.id).subscribe({
    next: (res) => {
      console.log('[EventDetail] register success:', res);

      // tampilkan pesan sukses dari backend kalau ada
      const msg =
        res?.message ||
        res?.data?.message ||
        'Berhasil mendaftar event.';

      alert(msg);

      // setelah daftar, kamu bisa redirect ke "Event Saya"
      // atau tetap di halaman ini
      // contoh:
      // this.router.navigate(['/event-saya']);
    },
    error: (err) => {
      console.error('[EventDetail] register failed:', err);

      const msg =
        err.error?.error ||
        err.error?.message ||
        'Gagal mendaftar event. Cek kembali status event atau coba lagi.';

      alert(msg);

      // this.isRegistering = false;
    },
  });
}
}
