// src/app/pages/admin/peserta/peserta.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EventService } from '../../../services/event.service';
import { UserService, UserDetail } from '../../../services/user.service';

interface Participant {
  registrationId: string;
  name: string;
  email: string;
  eventTitle: string;
  eventOrganizer: string;
  status: 'Terkonfirmasi' | 'Pending';
}

@Component({
  selector: 'app-peserta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './peserta.html',
  styleUrls: ['./peserta.css'],
})
export class Peserta implements OnInit {
  searchTerm = '';

  participants: Participant[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Halaman Peserta global → semua peserta dari semua event milik admin
    this.loadAllParticipantsForAdmin();
  }

  /**
   * 1. GET /events/my-events  → daftar event milik admin
   * 2. Untuk setiap event → GET /events/{id}/registrations
   * 3. Gabungkan semua ke this.participants
   */
  private loadAllParticipantsForAdmin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.participants = [];

    this.eventService.getMyEvents().subscribe({
      next: (resEvents: any) => {
        console.log('[Peserta] getMyEvents response (raw):', resEvents);

        const events = resEvents?.data ?? resEvents ?? [];
        console.log('[Peserta] events (hasil extract):', events);

        if (!Array.isArray(events)) {
          console.error('[Peserta] getMyEvents bukan array:', events);
          this.errorMessage = 'Format data event tidak sesuai.';
          this.isLoading = false;
          return;
        }

        // hanya event yang punya id yang JELAS
        const validEvents = events.filter((ev: any) => !!ev && !!ev.id);

        console.log(
          '[Peserta] event yang dipakai (id + title):',
          validEvents.map((ev: any) => ({
            id: ev.id,
            event_id: ev.event_id,
            uuid: ev.uuid,
            title: ev.title,
          }))
        );

        if (!validEvents.length) {
          console.warn(
            '[Peserta] Tidak ada event milik admin → tidak ada peserta.'
          );
          this.isLoading = false;
          return;
        }

        // buat request GET /events/{id}/registrations untuk tiap event
        const requests = validEvents.map((ev: any) => {
          /**
           * DI SINI KUNCI UTAMA:
           * - Kalau temen backend bilang ID event itu field "id" → pakai ev.id
           * - Kalau ternyata pakai "event_id" → ganti jadi ev.event_id
           * - Kalau pakai "uuid" → ganti jadi ev.uuid
           */
          const eventId = ev.id?.toString().trim();

          console.log(
            '[Peserta] panggil /events/' +
              eventId +
              '/registrations, raw event = ',
            ev
          );

          return this.eventService.getRegistrationsByEvent(eventId).pipe(
            catchError((err) => {
              console.error(
                '[Peserta] error saat ambil registrations untuk eventId',
                eventId,
                '→',
                err,
                'backend error:',
                err.error
              );
              // Biar 1 event error (400 "event not found") tidak menjatuhkan semuanya:
              return of({ data: [] });
            })
          );
        });

        // jalankan semua paralel
        forkJoin(requests).subscribe({
          next: (results: any[]) => {
            console.log('[Peserta] results registrations (raw):', results);

            const all: Participant[] = [];
            const registrationUserMap: Record<string, string> = {}; // regId → userId

            results.forEach((resRegs, index) => {
              const ev = validEvents[index];

              let raw: any = resRegs;
              if (Array.isArray(resRegs?.data)) {
                raw = resRegs.data;
              } else if (Array.isArray(resRegs?.data?.registrations)) {
                raw = resRegs.data.registrations;
              } else if (!Array.isArray(resRegs)) {
                raw = [];
              }

              if (!Array.isArray(raw)) {
                console.warn(
                  '[Peserta] data registrations bukan array untuk event:',
                  ev?.id,
                  raw
                );
                return;
              }

              raw.forEach((r: any) => {
                // kemungkinan lokasi data user:
                const user = r.user ?? r.participant ?? r.mahasiswa ?? r.student ?? {};

                // ==== NAMA PESERTA ====
                const nameCandidates = [
                  r.participant_name,
                  r.user_full_name,
                  r.user_name,
                  r.nama_peserta,
                  r.nama,
                  r.nama_lengkap,
                  r.full_name,
                  (user as any).full_name,
                  (user as any).nama_lengkap,
                  (user as any).nama,
                  (user as any).name,
                ];

                let name =
                  nameCandidates.find(
                    (val) =>
                      typeof val === 'string' && val.trim().length > 0
                  ) ?? '';

                // ==== EMAIL PESERTA ====
                const emailCandidates = [
                  r.participant_email,
                  r.user_email,
                  r.email,
                  (user as any).email,
                  (user as any).user_email,
                ];

                let email =
                  emailCandidates.find(
                    (val) =>
                      typeof val === 'string' && val.trim().length > 0
                  ) ?? '-';

                // Kalau backend sama sekali tidak kirim nama / email
                if (!name || name.trim().length === 0) {
                  console.warn(
                    '[Peserta] Tidak menemukan nama untuk registration',
                    r.id,
                    'raw object:',
                    r
                  );

                  // simpan mapping untuk di-lookup ke /users/:id nanti
                  if (r.user_id) {
                    registrationUserMap[r.id] = r.user_id;
                    // sementara tampilkan placeholder agar table tidak kosong
                    name = `User (${r.user_id})`;
                  } else {
                    name = 'Tanpa Nama';
                  }
                }

                if (!email || email.trim().length === 0) {
                  if (r.user_id && email === '-') {
                    console.warn(
                      '[Peserta] Tidak menemukan email untuk registration',
                      r.id
                    );
                  }
                  email = email || '-';
                }

                // ==== DATA EVENT ====
                const eventObj = r.event ?? ev ?? {};
                const eventTitle =
                  eventObj.title ?? r.event_title ?? 'Tanpa Judul';

                const eventOrganizer =
                  (eventObj as any).organizer_name ??
                  (eventObj as any).organizer ??
                  r.event_organizer ??
                  'Penyelenggara';

                // ==== STATUS ====
                const statusRaw: string = (r.status ?? '')
                  .toString()
                  .toLowerCase();
                const status: 'Terkonfirmasi' | 'Pending' =
                  statusRaw === 'confirmed' ||
                  statusRaw === 'approved' ||
                  statusRaw === 'terkonfirmasi' ||
                  statusRaw === 'registered'
                    ? 'Terkonfirmasi'
                    : 'Pending';

                all.push({
                  registrationId: r.id,
                  name,
                  email,
                  eventTitle,
                  eventOrganizer,
                  status,
                });
              });
            });

            this.participants = all;
            console.log('[Peserta] participants final (awal):', this.participants);
            this.isLoading = false;

            // Setelah participants terisi, coba lengkapi nama & email
            // untuk registration yang punya user_id tapi tidak punya nama asli
            this.enrichParticipantsWithUserDetails(registrationUserMap);
          },
          error: (err) => {
            console.error(
              '[Peserta] gagal load registrations per event (forkJoin error):',
              err
            );
            this.errorMessage =
              err.error?.error ||
              err.error?.message ||
              'Gagal memuat data peserta.';
            this.isLoading = false;
          },
        });
      },
      error: (err) => {
        console.error('[Peserta] gagal getMyEvents:', err);
        this.errorMessage =
          err.error?.error ||
          err.error?.message ||
          'Gagal memuat daftar event.';
        this.isLoading = false;
      },
    });
  }

  /**
   * Lengkapi nama & email peserta menggunakan UserService
   * berdasarkan user_id yang ada di registration.
   */
  private enrichParticipantsWithUserDetails(
    registrationUserMap: Record<string, string>
  ): void {
    const regIds = Object.keys(registrationUserMap);
    if (!regIds.length) return;

    console.log(
      '[Peserta] enrichParticipantsWithUserDetails, regIds:',
      regIds
    );

    regIds.forEach((regId) => {
      const userId = registrationUserMap[regId];
      if (!userId) return;

      this.userService.getUserById(userId).subscribe({
        next: (user: UserDetail) => {
          console.log(
            '[Peserta] user detail untuk regId',
            regId,
            '→',
            user
          );

          const idx = this.participants.findIndex(
            (p) => p.registrationId === regId
          );
          if (idx >= 0) {
            this.participants[idx] = {
              ...this.participants[idx],
              name: user.full_name || this.participants[idx].name,
              email: user.email || this.participants[idx].email,
            };
          }
        },
        error: (err) => {
          console.error(
            '[Peserta] gagal ambil user detail untuk userId',
            userId,
            'error:',
            err
          );
        },
      });
    });
  }

  // ========================
  //  FILTER PENCARIAN
  // ========================
  filteredParticipants(): Participant[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.participants;

    return this.participants.filter((p) =>
      (p.name + ' ' + p.email + ' ' + p.eventTitle + ' ' + p.eventOrganizer)
        .toLowerCase()
        .includes(term)
    );
  }

  // ========================
  //  AKSI BUTTON
  // ========================
  onExportExcel(): void {
    console.log('Export Excel diklik (belum terhubung ke backend)');
  }

  onView(p: Participant): void {
    console.log('Lihat peserta:', p);
  }

  onEdit(p: Participant): void {
    console.log('Edit peserta:', p);
  }

  onDelete(p: Participant): void {
    if (!confirm(`Yakin ingin menghapus peserta "${p.name}"?`)) return;
    this.participants = this.participants.filter((x) => x !== p);
  }
}
