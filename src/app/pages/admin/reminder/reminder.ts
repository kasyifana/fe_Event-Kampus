// src/app/pages/admin/reminder/reminder.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EventService } from '../../../services/event.service';

interface AutoReminder {
  id: string;          // h-3 | h-1 | h0
  label: string;       // label utama
  description: string; // deskripsi kecil
  active: boolean;     // on / off
}

interface SimpleEvent {
  id: string;
  name: string;
}

interface TemplateOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-reminder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reminder.html',
  styleUrls: ['./reminder.css'],
})
export class Reminder implements OnInit {
  // --- KIRI: reminder otomatis (dummy dulu) ---
  autoReminders: AutoReminder[] = [
    {
      id: 'h-3',
      label: 'H-3 Sebelum Event',
      description: 'Kirim reminder 3 hari sebelum event',
      active: true,
    },
    {
      id: 'h-1',
      label: 'H-1 Sebelum Event',
      description: 'Kirim reminder 1 hari sebelum event',
      active: false,
    },
    {
      id: 'h0',
      label: 'Hari H Event',
      description: 'Kirim reminder pagi hari event',
      active: false,
    },
  ];

  // --- KANAN: dropdown event & template ---
  events: SimpleEvent[] = [];
  templates: TemplateOption[] = [
    { id: 'reminder-3', name: 'Reminder H-3' },
    { id: 'reminder-1', name: 'Reminder H-1' },
    { id: 'reminder-day', name: 'Reminder Hari H' },
  ];

  manualData = {
    eventId: '',
    templateId: '',
    extraMessage: '',
  };

  isLoadingEvents = false;
  isSending = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEventsForDropdown();
  }

  // ==========================
  // LOAD EVENT UNTUK DROPDOWN
  // ==========================
  loadEventsForDropdown() {
    this.isLoadingEvents = true;

    // Bisa pakai getMyEvents() atau getEvents() tergantung kebutuhan
    this.eventService.getMyEvents().subscribe({
      next: (res) => {
        const data = res?.data || [];
        this.events = data.map((ev: any) => ({
          id: ev.id,
          name: ev.title || 'Tanpa Judul',
        }));
        this.isLoadingEvents = false;
      },
      error: (err) => {
        console.error('[Reminder] gagal load events:', err);
        // fallback dummy kalau gagal
        this.events = [
          { id: '1', name: 'Web Development' },
          { id: '2', name: 'ASEAN YOUTH MOVEMENT' },
          { id: '3', name: 'Konser UII' },
        ];
        this.isLoadingEvents = false;
      },
    });
  }

  // ==========================
  // REMINDER OTOMATIS (KIRI)
  // ==========================
  toggleAuto(rem: AutoReminder) {
    rem.active = !rem.active;
    console.log('Auto reminder changed:', rem);

    // NOTE:
    // Di sini nanti bisa dipanggil API backend, contoh:
    // this.reminderService.updateAutoReminder(rem.id, rem.active).subscribe(...)
  }

  // ==========================
  // REMINDER MANUAL (KANAN)
  // ==========================
  sendManualReminder(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isSending = true;

    const payload = {
      event_id: this.manualData.eventId,
      template_id: this.manualData.templateId,
      extra_message: this.manualData.extraMessage || undefined,
    };

    console.log('[Reminder] kirim manual (dummy):', payload);

    // NOTE:
    // Kalau backend sudah siap, di sini diganti:
    // this.reminderService.sendManual(payload).subscribe({...})

    setTimeout(() => {
      alert('Reminder manual dikirim (dummy).');
      this.isSending = false;
      this.manualData.extraMessage = '';
    }, 400);
  }
}
