import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthService,
  LoginRequest,
  ApiResponse,
  LoginResponse,
} from '../../services/auth.service';
import { WhitelistService } from '../../services/whitelist.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  form: LoginRequest = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private whitelistService: WhitelistService
  ) { }

  onSubmit() {
    console.log('onSubmit kepanggil, form:', this.form);

    if (!this.form.email || !this.form.password) {
      this.errorMessage = 'Email dan password wajib diisi.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.form).subscribe({
      next: (res: ApiResponse<LoginResponse>) => {
        console.log('Login berhasil, response API:', res);

        const token = res.data?.token;
        const user = res.data?.user;

        if (!token || !user) {
          this.errorMessage = 'Response login tidak sesuai format.';
          this.isLoading = false;
          return;
        }

        // simpan token + user
        this.authService.saveAuth(token, user);

        // ROLE-BASED REDIRECT
        if (user.role === 'admin') {
          // Admin langsung ke panel admin
          this.isLoading = false;
          this.router.navigate(['/admin']);
        } else {
          // Check whitelist status untuk user biasa
          this.checkWhitelistAndRedirect();
        }
      },
      error: (err: any) => {
        console.error('Gagal login, detail error:', err);
        this.isLoading = false;

        if (err.status === 0) {
          this.errorMessage = 'Tidak bisa menghubungi server (CORS / server down).';
        } else if (err.status === 400) {
          this.errorMessage = 'Request tidak valid (400). Cek email & password.';
        } else if (err.status === 401) {
          this.errorMessage = 'Email atau password salah (401).';
        } else {
          this.errorMessage = `Error ${err.status}: ${err.message || 'Login gagal.'}`;
        }
      },
    });
  }

  private checkWhitelistAndRedirect() {
    // Check if user has approved whitelist request
    this.whitelistService.getMyRequest().subscribe({
      next: (response) => {
        this.isLoading = false;
        const request = response.data;

        // If approved, redirect to admin panel (organizer)
        if (request && request.status === 'approved') {
          console.log('User is approved organizer, redirecting to admin');
          this.router.navigate(['/admin']);
        } else {
          // Regular user or pending/rejected, go to home
          this.router.navigate(['/home']);
        }
      },
      error: () => {
        // No whitelist request or error, just go to home
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
    });
  }
}
