import { collection, doc, setDoc, query, where, getDocs, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Attendance } from '@/types/biometric';
import { UserData } from '@/contexts/AuthContext';
import { verifyFace } from './biometricService';
import { isWithinGeofence } from './geofencingService';
import { uploadToCloudinaryUnsigned } from '@/lib/cloudinary';

// Fungsi untuk melakukan absensi dengan verifikasi wajah dan geofencing
export const checkAttendance = async (
  userId: string,
  type: 'check-in' | 'check-out',
  faceImage: File,
  userLocation: { latitude: number; longitude: number }
): Promise<Attendance> => {
  try {
    // 1. Ambil data pengguna langsung dari dokumen user berdasarkan ID
    // Gunakan getDoc untuk mengambil dokumen berdasarkan ID
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      console.error('User not found with uid:', userId);
      throw new Error('User not found');
    }
    
    const userData = userDocSnap.data() as UserData;
    userData.uid = userId; // Pastikan uid tersedia
    
    // 2. Verifikasi wajah menggunakan @vladmandic/face-api melalui biometricService
    console.log('Memulai verifikasi wajah dengan @vladmandic/face-api...');
    const faceVerification = await verifyFace(userId, faceImage);
    console.log(`Hasil verifikasi wajah: ${faceVerification.isMatch ? 'Berhasil' : 'Gagal'} dengan skor ${faceVerification.score.toFixed(2)}`);
    
    // 3. Verifikasi geofence jika diaktifkan
    let locationVerification = { isWithinGeofence: true };
    if (userData.geofenceSettings?.isRequired) {
      locationVerification.isWithinGeofence = isWithinGeofence(
        userLocation,
        userData.geofenceSettings
      );
    }
    
    // 4. Tentukan status absensi dengan logika yang diperbarui untuk @vladmandic/face-api
    let status: 'valid' | 'invalid' | 'manual_verification';
    let notes: string | undefined;
    
    // Gunakan threshold yang lebih spesifik untuk keputusan status
    const faceThreshold = 0.55; // Sesuai dengan threshold di biometricService
    
    if (faceVerification.isMatch && locationVerification.isWithinGeofence) {
      status = 'valid';
      notes = `Verifikasi berhasil dengan skor ${faceVerification.score.toFixed(2)}`;
    } else if (faceVerification.isMatch && !locationVerification.isWithinGeofence) {
      status = 'manual_verification';
      notes = `Wajah terverifikasi (skor: ${faceVerification.score.toFixed(2)}) tetapi lokasi di luar area geofence`;
    } else if (!faceVerification.isMatch && locationVerification.isWithinGeofence) {
      // Jika skor hampir mencapai threshold, beri kesempatan verifikasi manual
      if (faceVerification.score > 0.45) { // Sedikit di bawah threshold
        status = 'manual_verification';
        notes = `Wajah hampir terverifikasi (skor: ${faceVerification.score.toFixed(2)}) dan lokasi di dalam area geofence`;
      } else {
        status = 'invalid';
        notes = `Wajah tidak terverifikasi (skor: ${faceVerification.score.toFixed(2)}) meskipun lokasi di dalam area geofence`;
      }
    } else {
      status = 'invalid';
      notes = `Wajah tidak terverifikasi (skor: ${faceVerification.score.toFixed(2)}) dan lokasi di luar area geofence`;
    }
    
    // 5. Buat ID unik untuk absensi
    const attendanceId = doc(collection(db, 'attendance')).id;
    
    // 6. Upload gambar wajah ke Cloudinary untuk riwayat absensi menggunakan upload preset unsigned
    let faceImageUrl = '';
    let publicId = '';
    
    try {
      const uploadResult = await uploadToCloudinaryUnsigned(faceImage, `attendance/${userId}/${type}`);
      faceImageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (uploadError) {
      console.warn('Failed to upload attendance image, but continuing with attendance process:', uploadError);
    }
    
    // 7. Simpan data absensi
    const attendance: Attendance = {
      id: attendanceId,
      userId,
      timestamp: new Date().toISOString(),
      type,
      verificationMethod: 'face',
      faceImageUrl,
      publicId,
      location: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        locationName: userData.geofenceSettings?.locationName || 'Unknown',
        isWithinGeofence: locationVerification.isWithinGeofence
      },
      faceMatchScore: faceVerification.score,
      status,
      notes
    };
    
    // 7. Simpan ke Firestore dengan struktur yang lebih baik
    // Membuat koleksi attendance/{userId}/records/{attendanceId}
    await setDoc(doc(db, 'attendance', userId, 'records', attendanceId), attendance);
    
    return attendance;
  } catch (error) {
    console.error('Error processing attendance:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan riwayat absensi pengguna
export const getUserAttendanceHistory = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Attendance[]> => {
  try {
    // Gunakan struktur koleksi yang lebih baik: attendance/{userId}/records
    const attendanceRef = collection(db, 'attendance', userId, 'records');
    let q = query(
      attendanceRef,
      orderBy('timestamp', 'desc')
    );
    
    if (startDate && endDate) {
      q = query(
        attendanceRef,
        where('timestamp', '>=', startDate.toISOString()),
        where('timestamp', '<=', endDate.toISOString()),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Attendance[];
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan absensi hari ini
export const getTodayAttendance = async (userId: string): Promise<Attendance[]> => {
  try {
    // Dapatkan tanggal hari ini (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Dapatkan tanggal besok (00:00:00)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Gunakan struktur koleksi yang lebih baik: attendance/{userId}/records
    const attendanceRef = collection(db, 'attendance', userId, 'records');
    const q = query(
      attendanceRef,
      where('timestamp', '>=', today.toISOString()),
      where('timestamp', '<', tomorrow.toISOString()),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Attendance[];
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    throw error;
  }
};
