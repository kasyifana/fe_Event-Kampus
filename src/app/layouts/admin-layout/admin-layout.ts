import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, User } from '../../services/auth.service';

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

  currentUser: User | null = null;
  showProfileMenu = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.checkScreenSize();

    // Close sidebar on navigation (mobile only)
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) {
          this.sidebarOpen = false;
        }
        // Close profile menu on navigation
        this.showProfileMenu = false;
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

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Close sidebar when clicking a nav link (mobile only)
  onNavClick() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  // Close sidebar/menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Handle Sidebar closing on mobile
    if (this.isMobile && this.sidebarOpen) {
      const sidebar = document.querySelector('.admin-sidebar');
      const menuBtn = document.querySelector('.menu-btn');

      if (sidebar && !sidebar.contains(target) && !menuBtn?.contains(target)) {
        this.sidebarOpen = false;
      }
    }

    // Handle Profile Menu closing
    if (this.showProfileMenu) {
      const profileChip = document.querySelector('.user-chip');
      if (profileChip && !profileChip.contains(target)) {
        this.showProfileMenu = false;
      }
    }
  }
}
