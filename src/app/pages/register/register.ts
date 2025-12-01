// src/app/pages/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  AuthService,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
} from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  // form frontend (ada `agree`, tapi `agree` tidak dikirim ke API)
  form: RegisterRequest & { agree: boolean } = {
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    agree: false,
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    console.log('Form register dikirim:', this.form);

    // cek checkbox persetujuan
    if (!this.form.agree) {
      this.errorMessage =
        'Kamu harus menyetujui persetujuan notifikasi sebelum mendaftar.';
      return;
    }

    // (opsional) validasi sederhana di FE
    if (!this.form.email || !this.form.password || !this.form.full_name || !this.form.phone_number) {
      this.errorMessage = 'Semua field wajib diisi.';
      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage = 'Password minimal 8 karakter.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload: RegisterRequest = {
      email: this.form.email,
      full_name: this.form.full_name,
      password: this.form.password,
      phone_number: this.form.phone_number,
    };

    this.authService.register(payload).subscribe({
      next: (res: ApiResponse<LoginResponse>) => {
        console.log('Register sukses, response API:', res);

        // kalau suatu saat mau auto-login:
        // const token = res.data?.token;
        // const user  = res.data?.user;
        // if (token && user) this.authService.saveAuth(token, user);

        this.isLoading = false;
        // setelah berhasil, arahkan ke halaman login
        this.router.navigate(['/login']);
      },
      error: (err) => {
  console.error('Gagal register, detail error:', err);
  console.log('Body error dari backend:', err.error);
  this.isLoading = false;

  if (err.status === 0) {
    this.errorMessage =
      'Tidak bisa menghubungi server (CORS / server mati / jaringan bermasalah).';
  } else if (err.status === 400) {
    // 🔥 ambil pesan jelas dari backend
    const backendError =
      err.error?.error ||   // field "error" dari backend
      err.error?.message || // atau "message"
      'Data tidak valid. Cek email, password (min 8), dan nomor HP.';

    this.errorMessage = backendError;
  } else {
    this.errorMessage = `Register gagal (status ${err.status}). Cek kembali data atau server.`;
  }
},
    });
  }
}
