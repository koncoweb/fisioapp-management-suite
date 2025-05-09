// Konfigurasi Cloudinary
const CLOUD_NAME = 'dgotxtr3f';
const API_KEY = '719462345218577';
// API Secret tidak digunakan di browser untuk keamanan

// Nama upload preset untuk upload unsigned
const UPLOAD_PRESET = 'fisioapp_unsigned';

// Tipe untuk hasil upload
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
}

/**
 * Upload file ke Cloudinary menggunakan API server-side
 * Fungsi ini tidak digunakan di browser, hanya untuk referensi
 */
// export const uploadToCloudinary = async () => {
//   // Fungsi ini dihapus karena menggunakan library Node.js yang tidak kompatibel dengan browser
//   throw new Error('This function is not available in browser environment');
// };

/**
 * Upload file ke Cloudinary menggunakan upload preset unsigned (client-side)
 * @param file File yang akan diupload
 * @param folder Folder tujuan di Cloudinary
 * @returns Promise dengan hasil upload
 */
export const uploadToCloudinaryUnsigned = async (
  file: File | Blob,
  folder: string
): Promise<CloudinaryUploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Error uploading to Cloudinary with unsigned preset:', error);
    throw error;
  }
};

/**
 * Alias untuk uploadToCloudinaryUnsigned untuk backward compatibility
 */
export const uploadToCloudinary = uploadToCloudinaryUnsigned;

/**
 * Hapus file dari Cloudinary
 * Catatan: Penghapusan file dari browser memerlukan autentikasi yang aman
 * Sebaiknya implementasikan fungsi ini di backend
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  console.warn('Deleting files from Cloudinary should be implemented on the server-side');
  throw new Error('This function should be implemented on the server-side for security reasons');
};

/**
 * Konversi File/Blob ke base64
 * @param file File atau Blob yang akan dikonversi
 * @returns Promise dengan string base64
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};
