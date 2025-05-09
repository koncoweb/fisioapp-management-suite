export interface BiometricData {
  faceId: string;        // ID referensi ke penyimpanan data wajah
  faceImageUrl: string;  // URL foto wajah yang tersimpan (untuk preview)
  publicId: string;      // Public ID gambar di Cloudinary
  faceVector: Float32Array | number[];  // Vektor fitur wajah (untuk pencocokan)
  registeredAt: string;  // Timestamp pendaftaran data biometrik
  lastUpdated: string;   // Timestamp pembaruan terakhir
  isActive: boolean;     // Status aktif/nonaktif
}

export interface GeofenceSettings {
  radius: number;       // Radius dalam meter
  isRequired: boolean;  // Apakah geofencing wajib untuk absensi
  locationName: string; // Nama lokasi
  latitude: number;     // Latitude lokasi
  longitude: number;    // Longitude lokasi
}

export interface Attendance {
  id: string;
  userId: string;
  timestamp: string;
  type: 'check-in' | 'check-out';
  verificationMethod: 'face' | 'manual' | 'admin';
  faceImageUrl?: string;  // URL gambar wajah di Cloudinary
  publicId?: string;      // Public ID gambar di Cloudinary
  location?: {
    latitude: number;
    longitude: number;
    locationName: string;
    isWithinGeofence: boolean;
  };
  faceMatchScore?: number;  // Skor kemiripan 0-1
  status: 'valid' | 'invalid' | 'manual_verification';
  notes?: string;
}
