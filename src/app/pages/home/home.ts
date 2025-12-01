// src/app/pages/home/home.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EventService,
  EventFilters,
  EventCategory,
} from '../../services/event.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface EventCard {
  id: string;
  tag: string;          // Seminar / Workshop / Lomba / Konser
  title: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  quota: string;        // contoh: "10/50"
  quotaPercent: number; // 0 - 100, buat bar kuota
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  categories = ['Semua', 'Seminar', 'Workshop', 'Lomba', 'Konser'];
  activeCategory = 'Semua';

  searchTerm = '';
  isLoading = false;
  errorMessage = '';

  events: EventCard[] = [];

  constructor(
    private eventService: EventService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // =======================
  // LOAD EVENT DARI BACKEND
  // =======================
  loadEvents() {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: EventFilters = {};

    if (this.activeCategory !== 'Semua') {
      filters.category = this.mapCategoryToBackend(
        this.activeCategory
      ) as EventCategory;
    }

    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    this.eventService.getEvents(filters).subscribe({
      next: (res) => {
        const data = res?.data || [];
        console.log('[Home] events API:', data);

        this.events = data.map((ev: any): EventCard => {
          const start = ev.start_date ? new Date(ev.start_date) : new Date();

          const max = ev.max_participants || 0;
          const current = ev.current_participants || 0;
          const percent =
            max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

          const dateStr = start.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });

          const timeStr =
            start.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB';

          // --- HANDLE URL POSTER ---
          let img = ev.poster_url || 'assets/events/default.png';

          if (img.startsWith('http://localhost:8080')) {
            img = img.replace('http://localhost:8080', environment.fileBaseUrl);
          }

          return {
            id: ev.id,
            tag: this.mapCategoryLabel(ev.category),
            title: ev.title,
            organizer: ev.organizer_name || 'Penyelenggara',
            date: dateStr,
            time: timeStr,
            location:
              ev.location ||
              (ev.event_type === 'online' ? 'Online (Zoom)' : '-'),
            quota: `${current}/${max}`,
            quotaPercent: percent,
            image: img,
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Home] gagal load events:', err);
        this.errorMessage = 'Gagal memuat event. Coba refresh halaman.';
        this.isLoading = false;
      },
    });
  }

  setCategory(category: string) {
    this.activeCategory = category;
    this.loadEvents();
  }

  onSearch() {
    this.loadEvents();
  }

  onDetail(event: EventCard) {
    this.router.navigate(['/event', event.id]);
  }

  onImageError(ev: EventCard) {
    ev.image = 'assets/events/default.png';
  }

  private mapCategoryToBackend(label: string): string {
    switch (label) {
      case 'Seminar':
        return 'seminar';
      case 'Workshop':
        return 'workshop';
      case 'Lomba':
        return 'lomba';
      case 'Konser':
        return 'konser';
      default:
        return '';
    }
  }

  private mapCategoryLabel(cat: string): string {
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
}
