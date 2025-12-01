import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NotificationItem {
  type: 'reminder' | 'certificate' | 'success' | 'update';
  title: string;
  message: string;
  timeAgo: string;
  unread: boolean;
}

@Component({
  selector: 'app-notifikasi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifikasi.html',
  styleUrls: ['./notifikasi.css'],
})
export class Notifikasi {
  notifications: NotificationItem[] = [
    {
      type: 'reminder',
      title: 'Reminder: Workshop Web Development',
      message: 'Event akan dimulai dalam 3 hari. Jangan lupa untuk hadir!',
      timeAgo: '2 jam yang lalu',
      unread: true,
    },
    {
      type: 'certificate',
      title: 'Sertifikat Tersedia',
      message: 'Link sertifikat untuk Workshop UI/UX Design sudah bisa diakses.',
      timeAgo: '2 jam yang lalu',
      unread: true,
    },
    {
      type: 'success',
      title: 'Pendaftaran Berhasil',
      message:
        'Anda berhasil terdaftar untuk Seminar Kewirausahaan Digital',
      timeAgo: '2 jam yang lalu',
      unread: false,
    },
    {
      type: 'update',
      title: 'Perubahan Lokasi Event',
      message:
        'Lokasi Workshop Web Development dipindahkan ke Lab Komputer B',
      timeAgo: '2 jam yang lalu',
      unread: false,
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter((n) => n.unread).length;
  }

  markAllRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, unread: false }));
  }
}
