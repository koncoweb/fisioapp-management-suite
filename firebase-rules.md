# Aturan Firebase yang Diperbarui untuk Fisioapp Management Suite

## Aturan Firestore yang Diperbarui

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
      // Allow read of user profiles by authenticated users
      allow read: if isSignedIn();
      // Modified: Allow creation during registration when auth ID matches the document ID
      allow create: if isSignedIn() && request.auth.uid == userId;
      // Allow updates only by the owner or admin
      allow update: if isOwner(userId) || isAdmin();
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

    // Bookings collection rules - Updated to allow both admin and patient bookings
    match /bookings/{bookingId} {
      // Allow reading by involved parties (patient, therapist, or admin)
      allow read: if isSignedIn() && 
        (resource.data.patientId == request.auth.uid || 
         resource.data.therapistId == request.auth.uid || 
         isAdmin());
      
      // Allow creation by admin or if the authenticated user is the patient making the booking
      allow create: if isAdmin() || 
        (isSignedIn() && request.resource.data.patientId == request.auth.uid);
      
      // Allow updates by therapist assigned to the booking or admin
      allow update: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin());
        
      allow delete: if isAdmin();
    }

    // Payments collection rules
    match /payments/{paymentId} {
      allow read: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Therapy Sessions collection rules - Updated to allow patient bookings
    match /therapySessions/{sessionId} {
      allow read: if isSignedIn();
      
      // Allow creation by any signed in user
      allow create: if isSignedIn(); 
      
      // Allow updates by therapist assigned to the session or admin
      allow update: if isSignedIn() && 
        (resource.data.therapistId == request.auth.uid || isAdmin());
        
      allow delete: if isAdmin();
    }

    // Products collection rules
    match /products/{productId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }

    // === ATURAN BARU UNTUK BIOMETRIK DAN ABSENSI ===
    
    // Aturan untuk koleksi attendance
    match /attendance/{userId} {
      // Izinkan pengguna membaca data absensi mereka sendiri atau admin
      allow read: if isSignedIn() && (isOwner(userId) || isAdmin());
      // Izinkan pengguna membuat koleksi attendance mereka sendiri
      allow create: if isSignedIn() && isOwner(userId);
      // Hanya admin yang dapat mengupdate atau menghapus koleksi utama
      allow update: if isAdmin();
      allow delete: if isAdmin();
      
      // Aturan untuk subkoleksi records
      match /records/{recordId} {
        // Izinkan pengguna membaca catatan absensi mereka sendiri atau admin
        allow read: if isSignedIn() && (isOwner(userId) || isAdmin() || isTherapist());
        // Izinkan pengguna membuat catatan absensi mereka sendiri
        allow create: if isSignedIn() && (isOwner(userId) || isAdmin());
        // Hanya admin yang dapat mengupdate atau menghapus catatan absensi
        allow update: if isAdmin();
        allow delete: if isAdmin();
      }
    }

    // Deny access to all other collections by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Aturan Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Fungsi untuk memeriksa apakah pengguna sudah login
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Fungsi untuk memeriksa apakah pengguna adalah admin
    function isAdmin() {
      return isSignedIn() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Fungsi untuk memeriksa apakah pengguna adalah pemilik file
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Aturan untuk folder biometric
    match /biometric/{userId}/{fileName} {
      allow read: if isSignedIn() && (isAdmin() || isOwner(userId));
      allow write: if isSignedIn() && (isAdmin() || isOwner(userId));
      allow delete: if isSignedIn() && (isAdmin() || isOwner(userId));
    }
    
    // Aturan untuk folder attendance
    match /attendance/{userId}/{fileName} {
      allow read: if isSignedIn() && (isAdmin() || isOwner(userId));
      allow write: if isSignedIn() && (isAdmin() || isOwner(userId));
      allow delete: if isSignedIn() && isAdmin();
    }
    
    // Aturan untuk file lainnya
    match /{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}
```

## Cara Menerapkan Aturan

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Untuk Firestore:
   - Klik "Firestore Database" di menu sidebar
   - Klik tab "Rules"
   - Salin dan tempel aturan Firestore di atas
   - Klik "Publish"
4. Untuk Storage:
   - Klik "Storage" di menu sidebar
   - Klik tab "Rules"
   - Salin dan tempel aturan Storage di atas
   - Klik "Publish"

## Konfigurasi CORS untuk Firebase Storage

Untuk mengatasi masalah CORS, Anda perlu mengonfigurasi CORS di Firebase Storage:

1. Install Firebase CLI jika belum: `npm install -g firebase-tools`
2. Login ke Firebase: `firebase login`
3. Buat file `cors.json` dengan konten berikut:
   ```json
   [
     {
       "origin": ["http://localhost:8080", "https://tutorialappklinik.web.app", "https://tutorialappklinik.firebaseapp.com"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
4. Terapkan konfigurasi CORS: `gsutil cors set cors.json gs://tutorialappklinik.appspot.com`

Catatan: Ganti URL dan nama bucket dengan URL dan nama bucket aplikasi Anda yang sebenarnya.
