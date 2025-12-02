import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhitelistService } from '../../services/whitelist.service';
import { AuthService } from '../../services/auth.service';
import { WhitelistRequest } from '../../models/whitelist.model';
import { getErrorMessage } from '../../utils/error-handler.utils';
import { validateDocumentFile } from '../../utils/file.utils';

@Component({
    selector: 'app-whitelist-request',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './whitelist-request.html',
    styleUrls: ['./whitelist-request.css'],
})
export class WhitelistRequestPage implements OnInit {
    // Form data
    organizationName = '';
    selectedFile: File | null = null;

    // State
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Existing request
    existingRequest: WhitelistRequest | null = null;
    hasExistingRequest = false;

    constructor(
        private whitelistService: WhitelistService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadExistingRequest();
    }

    loadExistingRequest() {
        this.isLoading = true;
        this.whitelistService.getMyRequest().subscribe({
            next: (response) => {
                this.existingRequest = response.data;
                this.hasExistingRequest = true;
                this.isLoading = false;
            },
            error: (error) => {
                // 404 means no existing request, which is fine
                if (error.status !== 404) {
                    this.errorMessage = getErrorMessage(error);
                }
                this.isLoading = false;
            },
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        const validation = validateDocumentFile(file);
        if (!validation.valid) {
            this.errorMessage = validation.error || 'File tidak valid';
            this.selectedFile = null;
            return;
        }

        this.selectedFile = file;
        this.errorMessage = '';
    }

    onSubmit() {
        // Validation
        if (!this.organizationName.trim()) {
            this.errorMessage = 'Nama organisasi harus diisi';
            return;
        }

        if (!this.selectedFile) {
            this.errorMessage = 'Dokumen pendukung harus diunggah';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const formData = {
            organization_name: this.organizationName.trim(),
            document: this.selectedFile,
        };

        this.whitelistService.submitRequest(formData).subscribe({
            next: (response) => {
                this.successMessage = 'Permohonan berhasil dikirim! Mohon tunggu review dari admin.';
                this.existingRequest = response.data;
                this.hasExistingRequest = true;
                this.isLoading = false;

                // Reset form
                this.organizationName = '';
                this.selectedFile = null;
            },
            error: (error) => {
                this.errorMessage = getErrorMessage(error);
                this.isLoading = false;
            },
        });
    }

    get statusLabel(): string {
        if (!this.existingRequest) return '';

        switch (this.existingRequest.status) {
            case 'pending':
                return 'Menunggu Review';
            case 'approved':
                return 'Disetujui';
            case 'rejected':
                return 'Ditolak';
            default:
                return this.existingRequest.status;
        }
    }

    get statusClass(): string {
        if (!this.existingRequest) return '';

        switch (this.existingRequest.status) {
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

    get canSubmit(): boolean {
        return !this.hasExistingRequest || this.existingRequest?.status === 'rejected';
    }
}
