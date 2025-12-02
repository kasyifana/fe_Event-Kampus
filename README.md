# Event Campus - Angular Frontend

Aplikasi frontend untuk Event Campus - Sistem Manajemen Event Kampus menggunakan Angular 21.

## 🚀 Status Inisialisasi

✅ **Project Fully Initialized!**

Semua file models, services, guards, interceptors, dan utilities sudah dibuat dan terintegrasi dengan API backend.

## 📁 Struktur Project

```
src/app/
├── models/              # Type-safe interfaces untuk semua entity API
├── services/            # API integration services
├── guards/              # Route protection (auth, admin, organizer)
├── interceptors/        # HTTP middleware (auto token injection)
├── utils/               # Helper functions
├── pages/               # Page components
└── layouts/             # Layout components
```

## 🔧 Services Available

| Service | File | Endpoints Covered |
|---------|------|-------------------|
| Auth | `auth.service.ts` | Login, Register, Token management |
| Event | `event.service.ts` | CRUD events, filters, publish, poster upload |
| Registration | `registration.service.ts` | Register, cancel, my registrations |
| Attendance | `attendance.service.ts` | Mark attendance (single/bulk), get list |
| Whitelist | `whitelist.service.ts` | Submit request, review, get status |
| User | `user.service.ts` | Get user details |

## 🛡️ Route Guards

- **authGuard** - Melindungi route yang memerlukan login
- **adminGuard** - Melindungi route khusus admin
- **organizerGuard** - Melindungi route khusus organizer yang sudah disetujui

## 🔄 Auto Features

- ✅ Automatic token injection pada semua HTTP requests (via interceptor)
- ✅ Automatic redirect ke login saat token expired (401)
- ✅ Type-safe models untuk semua API responses

## 📚 Documentation

- **[FILES_CREATED.md](./FILES_CREATED.md)** - Daftar semua file yang dibuat
- **[SERVICE_USAGE_GUIDE.md](./SERVICE_USAGE_GUIDE.md)** - Contoh penggunaan services
- **[walkthrough.md](./.gemini/antigravity/brain/.../walkthrough.md)** - Dokumentasi lengkap setup

## 🎯 API Coverage

100% endpoint dari Swagger specification tercakup:

- ✅ Authentication (2 endpoints)
- ✅ Events (8 endpoints)  
- ✅ Registrations (4 endpoints)
- ✅ Attendance (3 endpoints)
- ✅ Whitelist (4 endpoints)

## 💻 Development

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

## 🔗 API Configuration

Backend API: `http://103.49.239.164:3000`

Proxy sudah dikonfigurasi di `proxy.conf.json` untuk development.

## 🚦 Next Steps

1. **Update existing components** untuk menggunakan services yang baru
2. **Add pages** untuk whitelist request dan attendance management
3. **Add error notifications** menggunakan toast/snackbar
4. **Add loading states** pada semua API calls
5. **Test** semua fitur dengan real API

## 📖 Quick Start Example

```typescript
import { RegistrationService } from './services/registration.service';
import { getErrorMessage } from './utils/error-handler.utils';

export class MyComponent {
  constructor(private registrationService: RegistrationService) {}

  registerForEvent(eventId: string) {
    this.registrationService.registerToEvent(eventId).subscribe({
      next: (response) => {
        console.log('Success!', response.data);
      },
      error: (error) => {
        alert(getErrorMessage(error));
      }
    });
  }
}
```

Lihat `SERVICE_USAGE_GUIDE.md` untuk lebih banyak contoh!

---

**Last Updated:** 2024-12-02  
**Angular Version:** 21.0.0  
**Status:** ✅ Ready for Development
