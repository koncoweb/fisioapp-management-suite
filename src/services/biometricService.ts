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
export const extractFaceFeatures = async (imageElement: HTMLImageElement): Promise<Float32Array> => {
  try {
    await loadFaceApiModels();
    
    // Validasi ukuran gambar
    if (imageElement.width < 100 || imageElement.height < 100) {
      throw new Error('Image is too small. Minimum size is 100x100 pixels');
    }
    
    // Ukuran gambar untuk deteksi (dari besar ke kecil)
    const sizes = [
      { width: 640, height: 480 },  // Ukuran standar
      { width: 480, height: 360 },  // Ukuran lebih kecil
      { width: 320, height: 240 }   // Ukuran terkecil
    ];
    
    // Buat canvas untuk menggambar gambar
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) {
      throw new Error('Failed to create canvas context');
    }
    
    // Opsi deteksi wajah yang lebih sensitif
    const ssdOptions = new faceapi.SsdMobilenetv1Options({
      minConfidence: 0.4,  // Turunkan confidence untuk deteksi yang lebih sensitif
      maxResults: 1
    });
    
    let detections = null;
    
    // Coba deteksi dengan berbagai ukuran gambar dan pengaturan
    for (const size of sizes) {
      console.log(`Mencoba deteksi dengan ukuran ${size.width}x${size.height}...`);
      
      // Atur ukuran canvas
      canvas.width = size.width;
      canvas.height = size.height;
      
      // Gambar gambar ke canvas dengan ukuran yang diinginkan
      context.drawImage(imageElement, 0, 0, size.width, size.height);
      
      // Coba deteksi dengan gambar normal
      detections = await faceapi.detectSingleFace(canvas, ssdOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
        
      if (detections) {
        console.log(`Deteksi berhasil dengan ukuran ${size.width}x${size.height}`);
        break;
      }
      
      // Jika tidak ada deteksi, coba dengan berbagai peningkatan kontras dan kecerahan
      const contrastSettings = [
        { contrast: 1.3, brightness: 10 },  // Sedikit peningkatan
        { contrast: 1.5, brightness: 15 },  // Peningkatan sedang
        { contrast: 1.7, brightness: 20 }   // Peningkatan tinggi
      ];
      
      let detected = false;
      
      for (const setting of contrastSettings) {
        const imageData = context.getImageData(0, 0, size.width, size.height);
        const data = imageData.data;
        
        // Tingkatkan kontras dan kecerahan sesuai pengaturan
        for (let i = 0; i < data.length; i += 4) {
          // Meningkatkan kontras dan kecerahan untuk setiap piksel
          data[i] = Math.min(255, Math.max(0, (data[i] - 128) * setting.contrast + 128 + setting.brightness));
          data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * setting.contrast + 128 + setting.brightness));
          data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * setting.contrast + 128 + setting.brightness));
        }
        
        context.putImageData(imageData, 0, 0);
        
        // Coba deteksi dengan gambar yang ditingkatkan kontrasnya
        console.log(`Mencoba dengan kontras ${setting.contrast} dan kecerahan ${setting.brightness} pada ukuran ${size.width}x${size.height}...`);
        detections = await faceapi.detectSingleFace(canvas, ssdOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();
          
        if (detections) {
          console.log(`Deteksi berhasil dengan kontras ${setting.contrast} dan kecerahan ${setting.brightness} pada ukuran ${size.width}x${size.height}`);
          detected = true;
          break;
        }
      }
      
      if (detected) break;
      
      // Jika masih tidak ada deteksi, coba dengan gambar grayscale
      const grayImageData = context.getImageData(0, 0, size.width, size.height);
      const grayData = grayImageData.data;
      
      for (let i = 0; i < grayData.length; i += 4) {
        // Konversi ke grayscale menggunakan formula standar
        const gray = 0.299 * grayData[i] + 0.587 * grayData[i+1] + 0.114 * grayData[i+2];
        grayData[i] = gray;
        grayData[i+1] = gray;
        grayData[i+2] = gray;
      }
      
      context.putImageData(grayImageData, 0, 0);
      
      // Coba deteksi dengan gambar grayscale
      console.log(`Mencoba dengan gambar grayscale pada ukuran ${size.width}x${size.height}...`);
      detections = await faceapi.detectSingleFace(canvas, ssdOptions)
        .withFaceLandmarks()
        .withFaceDescriptor();
        
      if (detections) {
        console.log(`Deteksi berhasil dengan gambar grayscale pada ukuran ${size.width}x${size.height}`);
        break;
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
    
    // Validasi ukuran file (max 10MB - ditingkatkan dari 5MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    // Buat URL objek dari file gambar
    const imageUrl = URL.createObjectURL(imageFile);
    
    try {
      // Buat elemen gambar dan tunggu hingga dimuat
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = imageUrl;
      });
      
      console.log(`Image loaded with dimensions: ${img.width}x${img.height}`);
      
      // Coba ekstrak fitur wajah dari gambar asli terlebih dahulu
      try {
        console.log('Mencoba ekstraksi fitur dari gambar asli...');
        const descriptor = await extractFaceFeatures(img);
        console.log('Ekstraksi fitur berhasil dari gambar asli');
        return descriptor;
      } catch (originalError) {
        console.log('Ekstraksi dari gambar asli gagal, mencoba dengan preprocessing...');
      }
      
      // Jika ekstraksi dari gambar asli gagal, coba dengan preprocessing
      // Buat canvas untuk preprocessing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }
      
      // Ubah ukuran gambar ke 640x480 untuk konsistensi
      canvas.width = 640;
      canvas.height = 480;
      ctx.drawImage(img, 0, 0, 640, 480);
      
      // Tingkatkan kontras dan kecerahan
      const imageData = ctx.getImageData(0, 0, 640, 480);
      const data = imageData.data;
      
      const contrast = 1.3;  // Nilai kontras (1.0 adalah normal)
      const brightness = 10;  // Nilai kecerahan (-255 hingga 255)
      
      for (let i = 0; i < data.length; i += 4) {
        // Meningkatkan kontras dan kecerahan untuk setiap piksel
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
        data[i+1] = Math.min(255, Math.max(0, (data[i+1] - 128) * contrast + 128 + brightness));
        data[i+2] = Math.min(255, Math.max(0, (data[i+2] - 128) * contrast + 128 + brightness));
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Buat gambar baru dari canvas yang telah diproses
      const processedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load processed image'));
        image.src = canvas.toDataURL('image/jpeg', 0.95);
      });
      
      console.log('Mencoba ekstraksi fitur dari gambar yang diproses...');
      const descriptor = await extractFaceFeatures(processedImg);
      console.log('Ekstraksi fitur berhasil dari gambar yang diproses');
      
      return descriptor;
    } finally {
      // Bersihkan URL objek
      URL.revokeObjectURL(imageUrl);
    }
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
    
    // 5. Hitung skor kemiripan dengan algoritma yang ditingkatkan
    // Menggunakan kombinasi euclideanDistance dan cosine similarity untuk hasil yang lebih baik
    const euclideanDistance = faceapi.euclideanDistance(capturedVector, storedVector);
    
    // Hitung cosine similarity (dot product dari vektor yang dinormalisasi)
    // Ini memberikan pengukuran sudut antara dua vektor, yang sering kali lebih baik untuk pengenalan wajah
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < capturedVector.length; i++) {
      dotProduct += capturedVector[i] * storedVector[i];
      normA += capturedVector[i] * capturedVector[i];
      normB += storedVector[i] * storedVector[i];
    }
    
    const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    
    // 6. Kombinasikan kedua metrik untuk skor akhir yang lebih kuat
    // Konversi euclidean distance ke similarity score (1 - distance)
    const euclideanSimilarity = Math.max(0, 1 - euclideanDistance);
    
    // Berikan bobot lebih pada cosine similarity (70%) karena lebih handal untuk pengenalan wajah
    const weightedScore = (euclideanSimilarity * 0.3) + (cosineSimilarity * 0.7);
    
    // Normalisasi skor ke rentang 0-1
    const normalizedScore = Math.max(0, Math.min(1, weightedScore));
    
    console.log(`Face verification details:`);
    console.log(`- Euclidean similarity: ${euclideanSimilarity.toFixed(3)}`);
    console.log(`- Cosine similarity: ${cosineSimilarity.toFixed(3)}`);
    console.log(`- Combined score: ${normalizedScore.toFixed(3)}`);
    
    // 7. Gunakan threshold yang lebih rendah (0.5) dengan algoritma yang lebih kuat
    const threshold = 0.5;
    const isMatch = normalizedScore > threshold;
    
    console.log(`Match result: ${isMatch ? 'MATCH' : 'NO MATCH'} (threshold: ${threshold})`);
    
    return {
      isMatch: isMatch,
      score: normalizedScore
    };
  } catch (error) {
    console.error('Error verifying face:', error);
    throw error;
  }
};
