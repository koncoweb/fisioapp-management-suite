# Panduan Deployment Aplikasi ke Netlify

## Persiapan

Aplikasi Fisioapp Management Suite telah dikonfigurasi untuk deployment ke Netlify. Berikut adalah file-file konfigurasi yang telah disiapkan:

1. `netlify.toml` - Konfigurasi utama untuk Netlify
2. `.env` - Variabel lingkungan lokal (tidak di-commit ke Git)
3. `.env.example` - Contoh variabel lingkungan yang diperlukan

## Langkah-langkah Deployment

### 1. Buat Akun Netlify

Jika belum memiliki akun Netlify, buat akun di [netlify.com](https://www.netlify.com/).

### 2. Deploy dengan Git

Cara termudah untuk men-deploy aplikasi adalah dengan menghubungkan repositori Git Anda:

1. Login ke dashboard Netlify
2. Klik tombol "New site from Git"
3. Pilih penyedia Git Anda (GitHub, GitLab, atau Bitbucket)
4. Pilih repositori aplikasi Anda
5. Pada langkah pengaturan build:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Klik "Deploy site"

### 3. Deploy Manual

Jika Anda ingin men-deploy secara manual:

1. Build aplikasi Anda:
   ```
   npm run build
   ```

2. Install Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

3. Login ke Netlify:
   ```
   netlify login
   ```

4. Deploy aplikasi:
   ```
   netlify deploy --prod
   ```

5. Ikuti petunjuk untuk memilih folder `dist` sebagai direktori publikasi

### 4. Konfigurasi Variabel Lingkungan

Setelah site Anda di-deploy, Anda perlu mengatur variabel lingkungan:

1. Di dashboard Netlify, pilih site Anda
2. Pergi ke "Site settings" > "Build & deploy" > "Environment"
3. Klik "Edit variables" dan tambahkan variabel berikut:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

4. Klik "Save"
5. Trigger redeploy dengan pergi ke "Deploys" dan klik "Trigger deploy" > "Deploy site"

### 5. Konfigurasi Domain Kustom (Opsional)

Untuk menggunakan domain kustom:

1. Di dashboard Netlify, pilih site Anda
2. Pergi ke "Site settings" > "Domain management"
3. Klik "Add custom domain"
4. Ikuti petunjuk untuk mengkonfigurasi domain Anda

## Troubleshooting

### Masalah Routing

Jika Anda mengalami masalah dengan routing (misalnya 404 saat refresh halaman), pastikan konfigurasi redirect di `netlify.toml` sudah benar:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Masalah dengan Variabel Lingkungan

Jika aplikasi tidak dapat mengakses variabel lingkungan:

1. Pastikan variabel dimulai dengan `VITE_` agar dapat diakses oleh aplikasi
2. Verifikasi bahwa variabel telah diatur dengan benar di dashboard Netlify
3. Trigger redeploy setelah mengubah variabel lingkungan

### Masalah dengan Firebase atau Cloudinary

Jika ada masalah dengan Firebase atau Cloudinary:

1. Periksa console browser untuk error
2. Pastikan variabel lingkungan sudah diatur dengan benar
3. Verifikasi bahwa CORS sudah dikonfigurasi dengan benar di Cloudinary
4. Pastikan aturan keamanan Firebase sudah dikonfigurasi dengan benar

## Sumber Daya Tambahan

- [Dokumentasi Netlify](https://docs.netlify.com/)
- [Panduan Vite untuk Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Dokumentasi Firebase](https://firebase.google.com/docs)
- [Dokumentasi Cloudinary](https://cloudinary.com/documentation)
