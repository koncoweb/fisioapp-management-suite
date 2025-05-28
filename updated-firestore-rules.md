# Aturan Firestore yang Diperbarui untuk Fisioapp Management Suite

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isTherapist() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'therapist';
    }

    function isPatient() {
      return isSignedIn() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role != 'admin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role != 'therapist';
    }

    // Users collection rules
    match /users/{userId} {
      // Allow read of user profiles by any authenticated user
      allow read: if isSignedIn();
      // Allow creation by: 1) self-registration, 2) admin, or 3) therapist (for patients)
      allow create: if isSignedIn() && (request.auth.uid == userId || isAdmin() || isTherapist());
      // Allow updates by the owner, admin, or therapist (for patients)
      allow update: if isOwner(userId) || isAdmin() || 
        (isTherapist() && request.resource.data.role == 'Pasien');
      // Allow deletion by admin
      allow delete: if isAdmin();
    }

    // Patients collection rules - Added for patient management
    match /patients/{patientId} {
      allow read: if isSignedIn();
      // Allow admins, therapists, and authenticated users to create patients
      allow create: if isSignedIn();
      // Allow admins and therapists to update patient data
      allow update: if isAdmin() || isTherapist();
      // Only admins can delete patient records
      allow delete: if isAdmin();
    }

    // Services collection rules
    match /services/{serviceId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // Transactions collection rules - Updated to allow any signed-in user to create transactions
    match /transactions/{transactionId} {
      allow read: if isSignedIn();
      // Allow any signed-in user to create transactions
      allow create: if isSignedIn();
      // Only admins can update or delete transactions
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Expenses collection rules - Added explicit rules for expenses
    match /expenses/{expenseId} {
      // Allow read by any signed-in user
      allow read: if isSignedIn();
      // Only admins can create, update, or delete expenses
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Bookings collection rules - Updated to allow admin, patient, and therapist access
    match /bookings/{bookingId} {
      // Allow reading by involved parties (patient, therapist, or admin)
      allow read: if isSignedIn() && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.therapistId == request.auth.uid || 
         isAdmin() || isTherapist());
      
      // Allow creation by admin, therapist, or if the authenticated user is the patient making the booking
      allow create: if isAdmin() || isTherapist() || 
        (isSignedIn() && request.resource.data.patientId == request.auth.uid);
      
      // Allow updates by therapist assigned to the booking, any therapist, or admin
      allow update: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin() || isTherapist());
        
      allow delete: if isAdmin();
    }

    // Payments collection rules
    match /payments/{paymentId} {
      allow read: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Therapy Sessions collection rules - Updated to allow therapist access
    match /therapySessions/{sessionId} {
      // Allow reading by any signed-in user
      allow read: if isSignedIn();
      
      // Allow creation by therapists and admins
      allow create: if isSignedIn() && (isTherapist() || isAdmin());
      
      // Allow updates by therapist assigned to the session, any therapist, or admin
      allow update: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isTherapist() || isAdmin());
        
      allow delete: if isAdmin();
    }

    // Products collection rules
    match /products/{productId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // Confirmed Therapy Sessions collection rules
    match /confirmedTherapySessions/{sessionId} {
      allow read: if isSignedIn();
      allow create, update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Aturan untuk koleksi attendance
    match /attendance/{userId} {
      // Admin, pemilik data, atau terapis (untuk data mereka sendiri) dapat melihat catatan absensi
      allow read: if isAdmin() || isOwner(userId) || (isTherapist() && request.auth.uid == userId);
      
      match /records/{recordId} {
        // Pemilik data dapat membuat dan membaca catatan absensi mereka sendiri
        allow create: if isOwner(userId);
        allow read: if isOwner(userId) || isAdmin() || (isTherapist() && userId == request.auth.uid);
        // Hanya admin yang dapat mengupdate atau menghapus catatan absensi
        allow update: if isAdmin();
        allow delete: if isAdmin();
      }
    }

    // Therapy Payments collection rules
    match /therapyPayments/{paymentId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin();
    }

    // Therapist Salaries collection rules
    match /therapistSalaries/{salaryId} {
      allow read: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin());
      allow create, update, delete: if isAdmin();
    }

    // Therapist Salary Items collection (sub-collection of therapistSalaries)
    match /therapistSalaries/{salaryId}/items/{itemId} {
      allow read: if isSignedIn() && 
        (get(/databases/$(database)/documents/therapistSalaries/$(salaryId)).data.therapistId == request.auth.uid || isAdmin());
      allow create, update, delete: if isAdmin();
    }

    // App Configuration collection rules
    match /appConfig/{configId} {
      // Allow ALL users to read app configuration, even if not signed in
      // This ensures logo and app settings are always accessible
      allow read: if true;
      // Only admins can create, update, or delete app configuration
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Deny access to all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Perubahan yang Dilakukan

1. **Koleksi Bookings**: Diperbarui untuk memungkinkan terapis mengakses halaman jadwal
   - Menambahkan `isTherapist()` ke kondisi `read` untuk memungkinkan semua terapis melihat jadwal
   - Menambahkan `isTherapist()` ke kondisi `create` untuk memungkinkan terapis membuat jadwal baru
   - Menambahkan `isTherapist()` ke kondisi `update` untuk memungkinkan terapis mengupdate jadwal

2. **Koleksi Attendance**: Mempertahankan struktur yang sudah diperbarui sebelumnya
   - Terapis dapat mengakses data absensi mereka sendiri

3. **Mempertahankan Struktur Koleksi yang Ada**:
   - `confirmedTherapySessions`
   - `therapistSalaries` dan subkoleksi `items`
   - Semua aturan lain yang sudah ada

## Cara Menerapkan Aturan

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik "Firestore Database" di menu sidebar
4. Klik tab "Rules"
5. Salin dan tempel aturan Firestore di atas (bagian yang ada di dalam tanda ```)
6. Klik "Publish"
