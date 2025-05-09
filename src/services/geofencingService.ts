import * as turf from '@turf/turf';
import { GeofenceSettings } from '@/types/biometric';

// Fungsi untuk memeriksa apakah lokasi berada dalam geofence
export const isWithinGeofence = (
  userLocation: { latitude: number; longitude: number },
  geofence: GeofenceSettings
): boolean => {
  // Buat titik untuk lokasi pengguna menggunakan turf.js
  const userPoint = turf.point([userLocation.longitude, userLocation.latitude]);
  
  // Buat titik untuk pusat geofence
  const geofenceCenter = turf.point([geofence.longitude, geofence.latitude]);
  
  // Hitung jarak antara dua titik (dalam meter)
  const distance = turf.distance(userPoint, geofenceCenter, { units: 'meters' });
  
  // Periksa apakah jarak kurang dari radius
  return distance <= geofence.radius;
};

// Fungsi untuk mendapatkan lokasi pengguna saat ini
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

// Fungsi untuk menghitung jarak antara dua titik koordinat (dalam meter)
export const calculateDistance = (
  location1: { latitude: number; longitude: number },
  location2: { latitude: number; longitude: number }
): number => {
  const point1 = turf.point([location1.longitude, location1.latitude]);
  const point2 = turf.point([location2.longitude, location2.latitude]);
  
  return turf.distance(point1, point2, { units: 'meters' });
};

// Fungsi untuk membuat buffer geofence (untuk visualisasi)
export const createGeofenceBuffer = (
  center: { latitude: number; longitude: number },
  radius: number
): GeoJSON.Feature<GeoJSON.Polygon> => {
  const centerPoint = turf.point([center.longitude, center.latitude]);
  // Konversi radius dari meter ke kilometer untuk turf.buffer
  const radiusInKm = radius / 1000;
  
  return turf.buffer(centerPoint, radiusInKm, { units: 'kilometers' });
};

// Fungsi untuk mendapatkan alamat dari koordinat (reverse geocoding)
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Unknown location';
  }
};
