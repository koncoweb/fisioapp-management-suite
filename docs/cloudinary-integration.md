# Integrasi Cloudinary untuk Penyimpanan Gambar

## Pendahuluan

Dokumen ini menjelaskan integrasi Cloudinary sebagai layanan penyimpanan gambar untuk aplikasi Fisioapp Management Suite. Cloudinary digunakan untuk menyimpan gambar biometrik wajah dan gambar absensi, menggantikan Firebase Storage.

## Konfigurasi Cloudinary

Konfigurasi Cloudinary dilakukan di file `src/lib/cloudinary.ts`. Kredensial Cloudinary disimpan dalam kode ini:

```typescript
// Konfigurasi Cloudinary
const CLOUD_NAME = 'dgotxtr3f';
const API_KEY = '719462345218577';
// API Secret tidak digunakan di browser untuk keamanan

// Nama upload preset untuk upload unsigned
const UPLOAD_PRESET = 'fisioapp_unsigned';
```

> **Catatan Keamanan**: Dalam lingkungan produksi, sebaiknya kredensial ini disimpan sebagai variabel lingkungan dan tidak di-hardcode dalam kode sumber.

## Struktur Penyimpanan

Gambar disimpan di Cloudinary dengan struktur folder sebagai berikut:

1. **Gambar Biometrik**: `biometric/{userId}/...`
2. **Gambar Absensi**: `attendance/{userId}/{type}/...`

## Fungsi Utama

### Upload Gambar

Untuk mengupload gambar ke Cloudinary dari browser, kita menggunakan metode upload unsigned:

```typescript
uploadToCloudinaryUnsigned(file: File | Blob, folder: string): Promise<CloudinaryUploadResult>
```

Fungsi ini mengupload file ke Cloudinary menggunakan upload preset unsigned yang memungkinkan upload langsung dari browser tanpa perlu API secret.

Untuk kompatibilitas dengan kode yang sudah ada, kita juga menyediakan alias:

```typescript
uploadToCloudinary = uploadToCloudinaryUnsigned
```

### Hapus Gambar

Penghapusan gambar dari Cloudinary sebaiknya dilakukan di sisi server untuk alasan keamanan. Dalam implementasi saat ini, fungsi ini akan memberikan peringatan:

```typescript
deleteFromCloudinary(publicId: string): Promise<void>
```

Fungsi ini akan menampilkan pesan peringatan dan melempar error karena alasan keamanan. Untuk implementasi penghapusan file, sebaiknya buat endpoint API di backend yang menangani penghapusan file dari Cloudinary.

## Integrasi dengan Layanan Biometrik

Layanan biometrik (`biometricService.ts`) telah dimodifikasi untuk menggunakan Cloudinary sebagai berikut:

1. **Menyimpan Data Biometrik**:
   - Gambar wajah diproses secara lokal menggunakan Face-API.js
   - Gambar wajah diupload ke Cloudinary menggunakan upload preset unsigned
   - URL gambar dan public ID disimpan di Firestore

2. **Verifikasi Wajah**:
   - Gambar wajah diproses secara lokal
   - Hasil verifikasi disimpan di Firestore
   - Gambar absensi diupload ke Cloudinary menggunakan upload preset unsigned (opsional)

3. **Menghapus Data Biometrik**:
   - Untuk implementasi saat ini, penghapusan gambar dari Cloudinary tidak didukung langsung dari browser
   - Data biometrik dihapus dari Firestore

## Integrasi dengan Layanan Absensi

Layanan absensi (`attendanceService.ts`) telah dimodifikasi untuk menggunakan Cloudinary sebagai berikut:

1. **Mencatat Absensi**:
   - Gambar wajah diupload ke Cloudinary
   - URL gambar dan public ID disimpan di Firestore bersama data absensi lainnya

## Tipe Data

Tipe data yang digunakan untuk integrasi Cloudinary:

1. **CloudinaryUploadResult**:
   ```typescript
   interface CloudinaryUploadResult {
     public_id: string;
     secure_url: string;
     format: string;
     width: number;
     height: number;
     resource_type: string;
   }
   ```

2. **BiometricData** (diperbarui):
   ```typescript
   interface BiometricData {
     // ...
     faceImageUrl: string;  // URL gambar wajah di Cloudinary
     publicId: string;      // Public ID gambar di Cloudinary
     // ...
   }
   ```

3. **Attendance** (diperbarui):
   ```typescript
   interface Attendance {
     // ...
     faceImageUrl?: string;  // URL gambar wajah di Cloudinary
     publicId?: string;      // Public ID gambar di Cloudinary
     // ...
   }
   ```

## Keuntungan Menggunakan Cloudinary

1. **Performa**: Cloudinary mengoptimalkan gambar secara otomatis untuk kecepatan loading
2. **Transformasi**: Cloudinary menyediakan transformasi gambar seperti resize, crop, dll.
3. **CDN**: Cloudinary menggunakan CDN global untuk pengiriman gambar yang cepat
4. **Keamanan**: Cloudinary menyediakan fitur keamanan seperti signed URLs
5. **Kuota**: Cloudinary menawarkan paket gratis dengan kuota yang cukup untuk aplikasi skala kecil

## Pertimbangan Keamanan

1. **API Key dan Secret**: Jangan menyimpan API key dan secret di kode sumber yang dapat diakses publik
2. **Signed URLs**: Untuk gambar sensitif, gunakan signed URLs
3. **Validasi**: Selalu validasi tipe file dan ukuran sebelum upload
4. **CORS**: Pastikan CORS dikonfigurasi dengan benar di Cloudinary

## Cara Membuat Upload Preset Unsigned di Cloudinary

Untuk menggunakan fitur upload unsigned, Anda perlu membuat upload preset di Cloudinary dengan langkah-langkah berikut:

1. Login ke [Cloudinary Dashboard](https://cloudinary.com/console)
2. Klik menu "Settings" (ikon roda gigi) di pojok kanan atas
3. Pilih tab "Upload"
4. Scroll ke bagian "Upload presets"
5. Klik tombol "Add upload preset"
6. Isi form dengan informasi berikut:
   - **Preset name**: `fisioapp_unsigned` (sesuai dengan konstanta `UPLOAD_PRESET` di kode)
   - **Signing Mode**: Pilih "Unsigned"
   - **Folder**: Biarkan kosong (folder akan ditentukan saat upload)
   - **Allowed formats**: Pilih format yang diizinkan (misalnya: jpg, png)
   - **Max file size**: Tentukan ukuran maksimum file (misalnya: 5MB)
7. Klik "Save" untuk menyimpan preset

## Struktur Folder yang Direkomendasikan

Untuk menjaga organisasi file yang baik di Cloudinary, gunakan struktur folder berikut:

- **biometric/{userId}**: Untuk menyimpan gambar biometrik wajah
- **attendance/{userId}/{type}**: Untuk menyimpan gambar absensi (type: check-in atau check-out)

## Troubleshooting

Jika mengalami masalah dengan integrasi Cloudinary, periksa:

1. **Cloud Name**: Pastikan menggunakan cloud name yang benar (`dgotxtr3f`)
2. **Upload Preset**: Pastikan upload preset (`fisioapp_unsigned`) sudah dibuat dan dikonfigurasi dengan benar
3. **CORS**: Pastikan CORS dikonfigurasi dengan benar di Cloudinary untuk mengizinkan permintaan dari domain aplikasi Anda
4. **Kuota**: Periksa apakah kuota Cloudinary masih tersedia
5. **Jaringan**: Pastikan aplikasi dapat terhubung ke API Cloudinary
6. **Console Errors**: Periksa console browser untuk error terkait Cloudinary
7. **Network Tab**: Periksa tab Network di DevTools browser untuk melihat respons API Cloudinary
