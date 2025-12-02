import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhitelistService } from '../../../services/whitelist.service';
import { WhitelistRequest } from '../../../models/whitelist.model';
import { getErrorMessage } from '../../../utils/error-handler.utils';
import { getFileUrl } from '../../../utils/file.utils';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-kelola-organisasi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kelola-organisasi.html',
  styleUrl: './kelola-organisasi.css',
})
export class KelolaOrganisasi implements OnInit {
  requests: WhitelistRequest[] = [];
  filteredRequests: WhitelistRequest[] = [];

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filter
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  searchKeyword = '';

  // Modal states
  showReviewModal = false;
  selectedRequest: WhitelistRequest | null = null;
  reviewAction: 'approve' | 'reject' = 'approve';
  adminNotes = '';

  constructor(private whitelistService: WhitelistService) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.errorMessage = '';

    this.whitelistService.getAllRequests().subscribe({
      next: (response) => {
        this.requests = response.data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = getErrorMessage(error);
        this.isLoading = false;
      },
    });
  }

  applyFilters() {
    let filtered = [...this.requests];

    // Filter by status
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === this.filterStatus);
    }

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.toLowerCase();
      filtered = filtered.filter(req =>
        req.organization_name.toLowerCase().includes(keyword) ||
        req.user_name?.toLowerCase().includes(keyword) ||
        req.user_email?.toLowerCase().includes(keyword)
      );
    }

    this.filteredRequests = filtered;
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  openReviewModal(request: WhitelistRequest, action: 'approve' | 'reject') {
    this.selectedRequest = request;
    this.reviewAction = action;
    this.adminNotes = '';
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedRequest = null;
    this.adminNotes = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitReview() {
    if (!this.selectedRequest) return;

    this.isLoading = true;
    this.errorMessage = '';

    const reviewData = {
      approved: this.reviewAction === 'approve',
      admin_notes: this.adminNotes.trim() || undefined,
    };

    this.whitelistService.reviewRequest(this.selectedRequest.id, reviewData).subscribe({
      next: () => {
        this.successMessage = `Permohonan berhasil ${this.reviewAction === 'approve' ? 'disetujui' : 'ditolak'}`;
        this.isLoading = false;
        this.closeReviewModal();
        this.loadRequests(); // Reload data

        // Clear message after 3s
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = getErrorMessage(error);
        this.isLoading = false;
      },
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Menunggu Review';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  get pendingCount(): number {
    return this.requests.filter(r => r.status === 'pending').length;
  }

  get approvedCount(): number {
    return this.requests.filter(r => r.status === 'approved').length;
  }

  get rejectedCount(): number {
    return this.requests.filter(r => r.status === 'rejected').length;
  }

  getDocumentUrl(url: string | undefined): string {
    if (!url) return '';

    // Transform localhost URLs to production server
    return url
      .replace(/http:\/\/localhost:8080/g, environment.fileBaseUrl)
      .replace(/http:\/\/localhost:3000/g, environment.fileBaseUrl);
  }
}
