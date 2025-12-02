import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { ReminderService } from '../../../services/reminder.service';

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

  constructor(
    private eventService: EventService,
    private reminderService: ReminderService
  ) { }

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
    // Simpan state lama untuk revert jika gagal
    const oldState = rem.active;
    rem.active = !rem.active;

    console.log('Auto reminder changing:', rem);

    this.reminderService.updateAutoReminder(rem.id, rem.active).subscribe({
      next: (res) => {
        console.log('[Reminder] Auto reminder updated:', res);
        // Optional: Show toast success
      },
      error: (err) => {
        console.error('[Reminder] Failed to update auto reminder:', err);
        // Revert state
        rem.active = oldState;
        const status = err.status || 'Unknown';
        const msg = err.error?.message || err.message || 'Unknown error';
        alert(`Gagal mengubah status auto reminder (Status: ${status}).\nPesan: ${msg}`);
      }
    });
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

    console.log('[Reminder] Sending manual reminder:', payload);

    this.reminderService.sendManualReminder(payload).subscribe({
      next: (res) => {
        console.log('[Reminder] Manual reminder sent:', res);
        alert('Reminder berhasil dikirim ke semua peserta event!');
        this.isSending = false;
        this.manualData.extraMessage = '';
        // Reset form if needed
        // form.resetForm();
      },
      error: (err) => {
        console.error('[Reminder] Failed to send manual reminder:', err);
        const status = err.status || 'Unknown';
        const msg = err.error?.message || err.message || 'Unknown error';
        alert(`Gagal mengirim reminder (Status: ${status}).\nPesan: ${msg}`);
        this.isSending = false;
      }
    });
  }
}
