import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { environment } from '../../../environments/environment';
import { Registration } from '../../models/registration.model';

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
    private registrationService: RegistrationService
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
        const registrations = res.data || [];

        console.log('[EventSaya] my-registrations:', registrations);

        if (!Array.isArray(registrations)) {
          console.error('[EventSaya] response data bukan array:', registrations);
          this.errorMessage = 'Format data tidak sesuai.';
          this.isLoading = false;
          return;
        }

        const now = new Date();

        registrations.forEach((reg: Registration) => {
          // Pastikan ada event details
          if (!reg.event) return;

          const ev = reg.event;
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
          let img = ev.poster_url || '';

          // fallback kalau benar-benar kosong
          if (!img) {
            img = 'assets/events/default.png';
          } else if (
            !img.startsWith('http') &&
            !img.startsWith('assets/')
          ) {
            if (img.startsWith('/')) {
              img = environment.fileBaseUrl + img;
            } else {
              img = environment.fileBaseUrl + '/' + img;
            }
          }

          // ========== KATEGORI ==========
          const categoryLabel = this.mapCategoryLabel(ev.category);

          // ========== STATUS ==========
          // Status event selesai jika tanggal berakhir sudah lewat
          // ATAU status registrasi 'attended' (sudah hadir)
          // ATAU status registrasi 'cancelled' (dibatalkan)

          const isPast = end.getTime() < now.getTime();

          // Kita anggap 'done' jika event sudah lewat atau user sudah hadir
          // Jika cancelled, mungkin tidak perlu ditampilkan atau masuk history?
          // Di sini kita masukkan history jika cancelled/attended/past.

          let status: 'upcoming' | 'done' = 'upcoming';

          if (reg.status === 'cancelled') {
            // Opsional: jangan tampilkan yang cancelled? 
            // Atau masukkan ke history dengan tanda cancelled?
            // Untuk sekarang kita skip yang cancelled agar tidak memenuhi list
            // return; 
            status = 'done'; // Masuk history
          } else if (reg.status === 'attended' || isPast) {
            status = 'done';
          } else {
            status = 'upcoming';
          }

          const mapped: EventItem = {
            id: ev.id,
            registrationId,
            category: categoryLabel,
            title: ev.title,
            organizer: ev.organizer_name || 'Penyelenggara', // Note: Registration model might need organizer_name in event
            date: dateStr,
            time: timeStr,
            place,
            posterUrl: img,
            status,
            certificateUrl: null, // Belum ada di model Registration
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
