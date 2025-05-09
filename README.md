# FisioApp Management Suite

## Deskripsi Aplikasi

FisioApp Management Suite adalah aplikasi manajemen klinik fisioterapi yang komprehensif, menyediakan fitur lengkap untuk mengelola pasien, jadwal, layanan, transaksi, dan administrasi klinik. Aplikasi ini dibangun dengan teknologi modern untuk memudahkan pengelolaan operasional klinik fisioterapi sehari-hari.

## Teknologi dan Dependensi Utama

### Framework dan Library Utama
- React 18 dengan TypeScript
- Vite sebagai build tool
- React Router untuk navigasi
- Firebase untuk backend dan database
- TanStack React Query untuk data fetching dan state management
- React Hook Form dengan Zod untuk validasi form
- Shadcn UI (berbasis Radix UI) untuk komponen UI

### Styling dan UI
- TailwindCSS untuk styling
- Lucide React untuk icon
- Framer Motion untuk animasi

## Struktur Aplikasi

### Struktur Folder
- `/src/components`: Komponen UI reusable
- `/src/contexts`: Context providers (Authentication, Theme)
- `/src/hooks`: Custom hooks
- `/src/lib`: Utilitas dan konfigurasi
- `/src/pages`: Halaman-halaman aplikasi
- `/src/services`: Layanan API
- `/src/types`: Type definitions TypeScript

### Modul Utama Aplikasi
- **Dashboard**: Panel kontrol utama
- **Manajemen Pasien**: Pengelolaan data pasien
- **Booking/Janji Temu**: Sistem penjadwalan
- **Manajemen Produk**: Pengelolaan produk dan layanan
- **Manajemen Karyawan**: Pengelolaan terapis dan staf
- **Point of Sale (POS)**: Sistem kasir dan pembayaran
- **Keuangan**: Manajemen keuangan klinik
- **Settings**: Pengaturan aplikasi

## Cara Kerja Aplikasi

### Autentikasi dan Otorisasi
- Sistem login dan registrasi
- Role-based access control (admin, therapist, Pasien)
- Protected routes untuk halaman yang memerlukan login

### Navigasi dan Routing
- Rute publik: Login, Register
- Rute terproteksi: Dashboard, Manajemen, dll (memerlukan login)
- Rute berdasarkan peran: Beberapa halaman hanya dapat diakses oleh admin

### Data Management
- Database untuk penyimpanan data
- React Query untuk state management dan data fetching
- Model data meliputi users, products, bookings, dan lainnya

### UI dan UX
- Komponen Shadcn UI yang dibangun di atas Radix UI
- Theme system dengan mode gelap/terang
- Responsive design dengan TailwindCSS
- Toast notifications untuk feedback user

## Cara Menjalankan Proyek

```sh
# Install dependencies
npm install
# atau
yarn install
# atau
bun install

# Menjalankan server development
npm run dev
# atau
yarn dev
# atau
bun dev
```

## Build untuk Production

```sh
npm run build
# atau
yarn build
# atau
bun build
```
