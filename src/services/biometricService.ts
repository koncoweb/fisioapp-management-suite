import * as faceapi from '@vladmandic/face-api';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BiometricData, GeofenceSettings } from '@/types/biometric';
import { UserData } from '@/contexts/AuthContext';
import { uploadToCloudinaryUnsigned, deleteFromCloudinary } from '@/lib/cloudinary';

// Inisialisasi face-api.js models
// Menggunakan variabel global untuk melacak status pemuatan model
let modelsLoaded = false;
// Menggunakan Promise untuk memastikan model hanya dimuat sekali
let modelLoadingPromise: Promise<void> | null = null;

export const loadFaceApiModels = async () => {
  // Jika model sudah dimuat, return langsung
  if (modelsLoaded) return;
  
  // Jika model sedang dimuat, tunggu sampai selesai
  if (modelLoadingPromise) {
    return modelLoadingPromise;
  }
  
  // Mulai proses pemuatan model
  modelLoadingPromise = (async () => {
    try {
      // Lokasi model face-api.js
      const MODEL_URL = '/models';
      
      // Load hanya model-model yang tersedia di folder public/models
      await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]);
      
      modelsLoaded = true;
      console.log('Face-API models loaded successfully');
    } catch (error) {
      console.error('Error loading Face-API models:', error);
      // Reset promise agar bisa mencoba lagi jika gagal
      modelLoadingPromise = null;
      throw error;
    }
  })();
  
  return modelLoadingPromise;
};

// Fungsi untuk mengekstrak fitur wajah dari gambar
export const extractFaceFeatures = async (imageElement: HTMLImageElement): Promise<Float32Array | null> => {
  try {
    await loadFaceApiModels();
    
    // Validasi ukuran gambar
    if (imageElement.width < 100 || imageElement.height < 100) {
      throw new Error('Image is too small. Minimum size is 100x100 pixels');
    }
    
    // Gunakan SSD MobileNet dengan parameter yang dioptimalkan untuk @vladmandic/face-api
    const ssdOptions = new faceapi.SsdMobilenetv1Options({ 
      minConfidence: 0.1, // Turunkan threshold confidence lebih rendah
      maxResults: 5 // Izinkan lebih banyak hasil deteksi
    });
    
    // Coba deteksi dengan SSD MobileNet
    let detections = await faceapi.detectSingleFace(imageElement, ssdOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // Jika tidak ada deteksi, coba dengan ukuran gambar yang berbeda
    if (!detections) {
      console.log('Trying with resized image...');
      
      // Buat canvas untuk mengubah ukuran gambar
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to create canvas context');
      }
      
      // Ubah ukuran gambar menjadi 640x480 (ukuran umum untuk deteksi wajah)
      canvas.width = 640;
      canvas.height = 480;
      context.drawImage(imageElement, 0, 0, 640, 480);
      
      // Coba deteksi lagi dengan gambar yang diubah ukurannya
      detections = await faceapi.detectSingleFace(canvas, ssdOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      // Jika masih tidak ada deteksi, coba dengan ukuran yang lebih kecil
      if (!detections) {
        console.log('Trying with smaller resized image...');
        
        // Ubah ukuran gambar menjadi 320x240 (ukuran lebih kecil)
        canvas.width = 320;
        canvas.height = 240;
        context.drawImage(imageElement, 0, 0, 320, 240);
        
        // Coba deteksi lagi dengan gambar yang diubah ukurannya
        detections = await faceapi.detectSingleFace(canvas, ssdOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();
      }
    }
    
    if (!detections) {
      throw new Error('No face detected in the image. Please ensure your face is clearly visible, well-lit, and centered in the image. Try taking the photo in a brighter environment with a neutral background.');
    }
    
    return detections.descriptor;
  } catch (error) {
    console.error('Error extracting face features:', error);
    throw error;
  }
};

// Fungsi untuk memproses gambar secara lokal tanpa upload terlebih dahulu
export const processImageLocally = async (imageFile: File): Promise<Float32Array | null> => {
  try {
    await loadFaceApiModels();
    
    // Validasi tipe file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image (JPEG, PNG, etc.)');
    }
    
    // Validasi ukuran file (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image is too large. Maximum size is 5MB');
    }
    
    // Buat URL objek dari file gambar
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Buat elemen gambar
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Menghindari masalah CORS
    
    // Tunggu gambar dimuat dengan timeout
    const imageLoaded = await new Promise<HTMLImageElement>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image loading timed out'));
      }, 10000); // 10 detik timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        
        // Validasi gambar yang dimuat
        if (img.width === 0 || img.height === 0) {
          reject(new Error('Image has invalid dimensions'));
          return;
        }
        
        // Jika gambar terlalu kecil, berikan pesan yang jelas
        if (img.width < 100 || img.height < 100) {
          reject(new Error('Image is too small. Minimum size is 100x100 pixels'));
          return;
        }
        
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image. The image might be corrupted or in an unsupported format.'));
      };
      
      img.src = imageUrl;
    });
    
    console.log(`Image loaded with dimensions: ${img.width}x${img.height}`);
    
    // Pra-pemrosesan gambar untuk meningkatkan deteksi wajah
    const processedImg = await preprocessImage(img);
    
    // Ekstrak fitur wajah dari gambar yang telah diproses
    const faceVector = await extractFaceFeatures(processedImg || img);
    
    // Bersihkan URL objek
    URL.revokeObjectURL(imageUrl);
    
    return faceVector;
  } catch (error) {
    console.error('Error processing image locally:', error);
    throw error;
  }
};

// Fungsi untuk pra-pemrosesan gambar untuk meningkatkan deteksi wajah
async function preprocessImage(img: HTMLImageElement): Promise<HTMLImageElement | null> {
  try {
    // Buat canvas untuk pra-pemrosesan
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;
    
    // Tentukan ukuran yang optimal untuk deteksi wajah
    // Tidak terlalu besar (untuk performa) dan tidak terlalu kecil (untuk akurasi)
    const maxDimension = 640;
    let width = img.width;
    let height = img.height;
    
    // Pertahankan rasio aspek saat mengubah ukuran
    if (width > height && width > maxDimension) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else if (height > maxDimension) {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
    
    // Atur ukuran canvas
    canvas.width = width;
    canvas.height = height;
    
    // Gambar gambar ke canvas dengan ukuran baru
    ctx.drawImage(img, 0, 0, width, height);
    
    // Buat gambar baru dari canvas
    const processedImg = new Image();
    processedImg.src = canvas.toDataURL('image/jpeg', 0.9);
    
    // Tunggu gambar yang diproses dimuat
    await new Promise((resolve) => {
      processedImg.onload = resolve;
    });
    
    return processedImg;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return null;
  }
}

// Fungsi untuk memproses dan menyimpan data biometrik
export const saveBiometricData = async (
  userId: string,
  imageFile: File
): Promise<BiometricData> => {
  try {
    // 1. Proses gambar langsung di browser tanpa upload terlebih dahulu
    const faceVector = await processImageLocally(imageFile);
    
    if (!faceVector) {
      throw new Error('Failed to extract face features');
    }
    
    // 2. Upload gambar ke Cloudinary menggunakan upload preset unsigned
    const uploadResult = await uploadToCloudinaryUnsigned(imageFile, `biometric/${userId}`);
    const faceImageUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;
    
    // 3. Simpan data biometrik ke Firestore
    const biometricData: BiometricData = {
      faceId: userId,
      faceImageUrl,
      publicId,
      faceVector: Array.from(faceVector),
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: true
    };
    
    // 4. Update dokumen pengguna dengan data biometrik
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { biometricData });
    
    return biometricData;
  } catch (error) {
    console.error('Error saving biometric data:', error);
    throw error;
  }
};

// Fungsi untuk memperbarui pengaturan geofencing
export const saveGeofenceSettings = async (
  userId: string,
  geofenceSettings: GeofenceSettings
): Promise<GeofenceSettings> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { geofenceSettings });
    return geofenceSettings;
  } catch (error) {
    console.error('Error saving geofence settings:', error);
    throw error;
  }
};

// Fungsi untuk menghapus data biometrik
export const deleteBiometricData = async (userId: string): Promise<void> => {
  try {
    // 1. Ambil data pengguna untuk mendapatkan publicId gambar
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() as UserData;
    
    // 2. Hapus gambar dari Cloudinary jika publicId tersedia
    if (userData?.biometricData?.publicId) {
      await deleteFromCloudinary(userData.biometricData.publicId);
    }
    
    // 3. Hapus data biometrik dari Firestore
    await updateDoc(userRef, { biometricData: null });
  } catch (error) {
    console.error('Error deleting biometric data:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan daftar semua pengguna
export const getUsersList = async (): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const usersList: UserData[] = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data() as UserData;
      userData.uid = doc.id; // Pastikan uid tersedia
      usersList.push(userData);
    });
    
    return usersList;
  } catch (error) {
    console.error('Error getting users list:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data biometrik pengguna
export const getUserBiometricData = async (userId: string): Promise<UserData> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() as UserData;
    userData.uid = userDoc.id;
    
    return userData;
  } catch (error) {
    console.error('Error getting user biometric data:', error);
    throw error;
  }
};

// Fungsi untuk memverifikasi wajah
export const verifyFace = async (
  userId: string,
  capturedImage: File
): Promise<{ isMatch: boolean; score: number }> => {
  try {
    await loadFaceApiModels();
    
    // 1. Proses gambar langsung di browser tanpa upload terlebih dahulu
    const capturedVector = await processImageLocally(capturedImage);
    
    if (!capturedVector) {
      throw new Error('Failed to extract face features from captured image');
    }
    
    // 2. Upload gambar untuk riwayat absensi (background task)
    const timestamp = Date.now();
    uploadToCloudinaryUnsigned(capturedImage, `attendance/${userId}`).catch(err => {
      console.warn('Failed to upload attendance image, but verification continues:', err);
    });
    
    // 3. Ambil vektor fitur yang tersimpan dari database
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data() as UserData;
    
    if (!userData?.biometricData?.faceVector) {
      throw new Error('No biometric data found for this user');
    }
    
    // 4. Konversi array ke Float32Array jika perlu
    const storedVector = new Float32Array(userData.biometricData.faceVector as number[]);
    
    // 5. Hitung skor kemiripan menggunakan @vladmandic/face-api
    // Menggunakan euclideanDistance untuk menghitung jarak antara dua vektor wajah
    const distance = faceapi.euclideanDistance(capturedVector, storedVector);
    
    // 6. Konversi jarak ke skor kemiripan (jarak yang lebih kecil = kemiripan yang lebih tinggi)
    // Gunakan threshold yang sedikit lebih rendah (0.55) untuk mengakomodasi perbedaan kamera
    const score = Math.max(0, 1 - distance);
    
    console.log(`Face verification score: ${score.toFixed(2)}`);
    
    // 7. Kembalikan hasil verifikasi dengan threshold yang disesuaikan
    // Threshold diturunkan sedikit untuk mengakomodasi perbedaan kamera
    return {
      isMatch: score > 0.55, // Threshold kemiripan 55% (lebih toleran)
      score
    };
  } catch (error) {
    console.error('Error verifying face:', error);
    throw error;
  }
};
