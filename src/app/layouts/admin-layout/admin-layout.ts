// src/app/layouts/admin-layout/admin-layout.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
})
export class AdminLayout implements OnInit {
  sidebarOpen = true;
  isMobile = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkScreenSize();

    // Close sidebar on navigation (mobile only)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) {
          this.sidebarOpen = false;
        }
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    // On mobile, sidebar starts closed
    if (this.isMobile && !wasMobile) {
      this.sidebarOpen = false;
    }
    // When switching back to desktop, open sidebar
    else if (!this.isMobile && wasMobile) {
      this.sidebarOpen = true;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Close sidebar when clicking a nav link (mobile only)
  onNavClick() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  // Close sidebar when clicking outside on mobile
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isMobile || !this.sidebarOpen) return;

    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.admin-sidebar');
    const menuBtn = document.querySelector('.menu-btn');

    if (sidebar && !sidebar.contains(target) && !menuBtn?.contains(target)) {
      this.sidebarOpen = false;
    }
  }
}
