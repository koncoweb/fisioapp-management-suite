import React, { useRef, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, RefreshCw, Scan, Check, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { BiometricData, GeofenceSettings } from '@/types/biometric';
import { saveBiometricData, deleteBiometricData } from '@/services/biometricService';
import { saveGeofenceSettings } from '@/services/biometricService';
import { EmployeeFormData } from '../EmployeeForm';

interface BiometricDataFieldsProps {
  form: UseFormReturn<EmployeeFormData>;
  employeeId?: string;
}

const BiometricDataFields: React.FC<BiometricDataFieldsProps> = ({ form, employeeId }) => {
  const { toast } = useToast();
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    form.getValues('biometricData')?.faceImageUrl || null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'none' | 'scanning' | 'detected' | 'error'>('none');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Efek untuk menginisialisasi kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          // Minta akses kamera dengan resolusi yang lebih tinggi
          const constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user' // Gunakan kamera depan
            }
          };
          
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Log resolusi kamera yang didapat
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                console.log(`Kamera diaktifkan dengan resolusi: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
              }
            };
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          toast({
            title: "Error",
            description: "Gagal mengakses kamera. Pastikan kamera Anda terhubung dan izin diberikan.",
            variant: "destructive",
          });
          setIsCameraActive(false);
        }
      }
    };
    
    setupCamera();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, toast]);
  
  // Fungsi untuk mengambil gambar dari kamera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Tidak dapat mengakses konteks canvas');
      }
      
      // Buat canvas dengan ukuran tetap untuk memastikan resolusi yang cukup
      const targetWidth = 640;
      const targetHeight = 480;
      
      // Set ukuran canvas ke ukuran target
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Gambar frame video ke canvas dengan ukuran yang disesuaikan
      context.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Konversi canvas ke URL data
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);
      console.log('Preview URL set:', dataUrl.substring(0, 50) + '...');
      
      // Update status deteksi wajah
      setFaceDetectionStatus('scanning');
      
      // Tampilkan pesan loading
      toast({
        title: "Memproses",
        description: "Sedang memproses gambar dan mendeteksi wajah...",
      });
      
      // Konversi dataURL ke File
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setFaceDetectionStatus('error');
          throw new Error('Gagal mengkonversi gambar');
        }
        
        console.log('Blob created, size:', blob.size);
        const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
        try {
          await processBiometricImage(file);
          setFaceDetectionStatus('detected');
        } catch (error) {
          setFaceDetectionStatus('error');
          throw error;
        }
      }, 'image/jpeg', 0.9); // Kualitas 90%
      
      // Matikan kamera setelah mengambil gambar
      setIsCameraActive(false);
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    } catch (error: any) {
      setFaceDetectionStatus('error');
      console.error('Error capturing image:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengambil gambar dari kamera",
        variant: "destructive",
      });
    }
  };
  
  // Fungsi untuk memulai deteksi wajah secara real-time
  const startFaceDetection = () => {
    if (!isCameraActive || !videoRef.current) return;
    
    // Simulasi deteksi wajah (dalam implementasi nyata, gunakan face-api.js)
    // Ini hanya untuk UI demo, deteksi wajah sebenarnya dilakukan saat processBiometricImage
    const checkFace = () => {
      if (isCameraActive && videoRef.current) {
        // Simulasi deteksi wajah dengan probabilitas 70%
        const detected = Math.random() > 0.3;
        setFaceDetected(detected);
        
        // Jika kamera masih aktif, periksa lagi setelah 1 detik
        setTimeout(() => {
          if (isCameraActive) checkFace();
        }, 1000);
      }
    };
    
    // Mulai deteksi wajah
    checkFace();
  };
  
  // Panggil startFaceDetection saat kamera aktif
  useEffect(() => {
    if (isCameraActive) {
      startFaceDetection();
    } else {
      setFaceDetected(false);
    }
  }, [isCameraActive]);
  
  // Fungsi untuk upload gambar
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Hanya file gambar yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }
      
      // Tampilkan preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Tampilkan pesan loading
      toast({
        title: "Memproses",
        description: "Sedang memproses gambar dan mendeteksi wajah...",
      });
      
      await processBiometricImage(file);
    } catch (error: any) {
      console.error('Error handling file:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses file gambar",
        variant: "destructive",
      });
    } finally {
      // Reset input file agar bisa upload file yang sama lagi
      if (event.target) {
        event.target.value = '';
      }
    }
  };
  
  // Fungsi untuk memproses dan menyimpan data biometrik
  const processBiometricImage = async (imageFile: File) => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "ID karyawan tidak ditemukan. Simpan data karyawan terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setFaceDetectionStatus('scanning');
    
    try {
      // Validasi ukuran file
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Ukuran gambar terlalu besar. Maksimal 5MB');
      }
      
      // Validasi tipe file
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar (JPEG, PNG, dll)');
      }
      
      const biometricData = await saveBiometricData(employeeId, imageFile);
      form.setValue('biometricData', biometricData);
      
      // Update status deteksi wajah
      setFaceDetectionStatus('detected');
      
      toast({
        title: "Sukses",
        description: "Data biometrik berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Error processing biometric data:', error);
      
      // Update status deteksi wajah
      setFaceDetectionStatus('error');
      
      // Memberikan pesan error yang lebih spesifik
      let errorMessage = "Gagal memproses data biometrik";
      
      if (error.message) {
        if (error.message.includes('No face detected')) {
          errorMessage = "Tidak ada wajah terdeteksi dalam gambar. Pastikan wajah terlihat jelas, pencahayaan baik, dan wajah berada di tengah gambar.";
        } else if (error.message.includes('too small')) {
          errorMessage = "Gambar terlalu kecil. Ukuran minimum adalah 100x100 piksel.";
        } else if (error.message.includes('too large')) {
          errorMessage = "Ukuran gambar terlalu besar. Maksimal 5MB.";
        } else if (error.message.includes('Image loading timed out')) {
          errorMessage = "Waktu memuat gambar habis. Coba gunakan gambar yang lebih kecil atau periksa koneksi internet Anda.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fungsi untuk menghapus data biometrik
  const handleDeleteBiometricData = async () => {
    if (!employeeId) return;
    
    setIsProcessing(true);
    
    try {
      await deleteBiometricData(employeeId);
      
      // Reset form data
      form.setValue('biometricData', null);
      setPreviewUrl(null);
      
      toast({
        title: "Sukses",
        description: "Data biometrik berhasil dihapus",
      });
    } catch (error) {
      console.error('Error deleting biometric data:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus data biometrik",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fungsi untuk menyimpan pengaturan geofence
  const handleSaveGeofenceSettings = async () => {
    if (!employeeId) return;
    
    setIsProcessing(true);
    
    try {
      const geofenceSettings = form.getValues('geofenceSettings');
      
      if (!geofenceSettings) {
        throw new Error('Pengaturan geofence tidak ditemukan');
      }
      
      await saveGeofenceSettings(employeeId, geofenceSettings);
      
      toast({
        title: "Sukses",
        description: "Pengaturan geofence berhasil disimpan",
      });
    } catch (error) {
      console.error('Error saving geofence settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan geofence",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Komponen untuk mengambil foto dari kamera atau upload file
  const BiometricCapture = () => {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-center space-x-2">
            <Button
              type="button"
              variant={captureMode === 'upload' ? "default" : "outline"}
              onClick={() => setCaptureMode('upload')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Foto
            </Button>
            <Button
              type="button"
              variant={captureMode === 'camera' ? "default" : "outline"}
              onClick={() => setCaptureMode('camera')}
            >
              <Camera className="h-4 w-4 mr-2" />
              Kamera
            </Button>
          </div>
          
          {captureMode === 'upload' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || !employeeId}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih File
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isProcessing || !employeeId}
                />
              </div>
              
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-md"
                  />
                </div>
              )}
              
              {!employeeId && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                  Simpan data karyawan terlebih dahulu sebelum menambahkan data biometrik.
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p className="font-medium">Panduan foto biometrik yang baik:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Pastikan wajah terlihat jelas dan berada di tengah gambar</li>
                  <li>Pencahayaan yang baik dan merata</li>
                  <li>Tidak menggunakan kacamata hitam atau penutup wajah</li>
                  <li>Ekspresi netral (tidak tersenyum berlebihan)</li>
                  <li>Resolusi minimal 100x100 piksel</li>
                </ul>
              </div>
              
              {form.watch('biometricData')?.isActive && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteBiometricData}
                  disabled={isProcessing || !employeeId}
                >
                  Hapus Data Biometrik
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                {isCameraActive ? (
                  <Button
                    type="button"
                    onClick={captureImage}
                    disabled={isProcessing || !employeeId}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Ambil Foto
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsCameraActive(true)}
                    disabled={isProcessing || !employeeId}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Aktifkan Kamera
                  </Button>
                )}
              </div>
              
              {isCameraActive ? (
                <div className="relative">
                  <div className="flex justify-center">
                    <div className="relative w-[240px] h-[320px] overflow-hidden rounded-md border-2 border-gray-300 bg-gray-100">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        width="640"
                        height="480"
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      
                      {/* Overlay untuk panduan wajah */}
                      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
                        <div className="w-[180px] h-[220px] border-2 border-dashed rounded-full border-blue-400 flex items-center justify-center">
                          {faceDetected ? (
                            <div className="bg-green-500 bg-opacity-20 w-full h-full rounded-full flex items-center justify-center">
                              <Check className="text-green-500 h-8 w-8" />
                            </div>
                          ) : (
                            <div className="text-blue-500 text-opacity-70 text-center">
                              <Scan className="h-8 w-8 mx-auto animate-pulse" />
                              <p className="text-xs mt-2 font-medium">Posisikan wajah di dalam area</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indikator status deteksi */}
                  <div className="mt-2 text-center text-sm">
                    <span className="inline-flex items-center gap-1">
                      {faceDetected ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-green-600">Wajah terdeteksi</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                          <span className="text-yellow-600">Mencari wajah...</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-[240px] h-[320px] overflow-hidden rounded-md border-2 border-gray-300">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading preview image');
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzU1NSI+UHJldmlldyB0aWRhayB0ZXJzZWRpYTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    
                    {/* Overlay status deteksi wajah */}
                    {faceDetectionStatus !== 'none' && (
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-sm">
                        {faceDetectionStatus === 'scanning' && (
                          <div className="bg-blue-500 bg-opacity-70 text-white py-1 px-2 rounded-md flex items-center justify-center gap-1">
                            <Scan className="h-4 w-4 animate-pulse" />
                            <span>Memproses...</span>
                          </div>
                        )}
                        {faceDetectionStatus === 'detected' && (
                          <div className="bg-green-500 bg-opacity-70 text-white py-1 px-2 rounded-md flex items-center justify-center gap-1">
                            <Check className="h-4 w-4" />
                            <span>Wajah terdeteksi</span>
                          </div>
                        )}
                        {faceDetectionStatus === 'error' && (
                          <div className="bg-red-500 bg-opacity-70 text-white py-1 px-2 rounded-md flex items-center justify-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Gagal mendeteksi wajah</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              <canvas ref={canvasRef} className="hidden" />
              
              {!employeeId && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
                  Simpan data karyawan terlebih dahulu sebelum menambahkan data biometrik.
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <p className="font-medium">Panduan foto biometrik yang baik:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Pastikan wajah terlihat jelas dan berada di tengah gambar</li>
                  <li>Pencahayaan yang baik dan merata</li>
                  <li>Tidak menggunakan kacamata hitam atau penutup wajah</li>
                  <li>Ekspresi netral (tidak tersenyum berlebihan)</li>
                </ul>
              </div>
              
              {form.watch('biometricData')?.isActive && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteBiometricData}
                  disabled={isProcessing || !employeeId}
                >
                  Hapus Data Biometrik
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Komponen untuk pengaturan geofencing
  const GeofenceSettings = () => {
    // Memastikan pengaturan geofence memiliki nilai default
    const ensureGeofenceSettings = () => {
      const currentSettings = form.getValues('geofenceSettings');
      if (!currentSettings) {
        const defaultSettings: GeofenceSettings = {
          isRequired: false,
          locationName: '',
          latitude: 0,
          longitude: 0,
          radius: 100,
        };
        form.setValue('geofenceSettings', defaultSettings);
        return defaultSettings;
      }
      return currentSettings;
    };

    // Fungsi untuk memperbarui satu properti geofence
    const updateGeofenceSetting = <K extends keyof GeofenceSettings>(key: K, value: GeofenceSettings[K]) => {
      const settings = ensureGeofenceSettings();
      form.setValue('geofenceSettings', { ...settings, [key]: value });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="geofence-required">Wajib dalam Area Geofence</Label>
          <Switch
            id="geofence-required"
            checked={form.watch('geofenceSettings')?.isRequired || false}
            onCheckedChange={(checked) => updateGeofenceSetting('isRequired', checked)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Nama Lokasi</Label>
            <Input
              id="location-name"
              value={form.watch('geofenceSettings')?.locationName || ''}
              onChange={(e) => updateGeofenceSetting('locationName', e.target.value)}
              placeholder="Kantor Pusat"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="radius">Radius (meter): {form.watch('geofenceSettings')?.radius || 100}</Label>
            <Slider
              id="radius"
              min={50}
              max={500}
              step={10}
              value={[form.watch('geofenceSettings')?.radius || 100]}
              onValueChange={(value) => updateGeofenceSetting('radius', value[0])}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              placeholder="-6.2088"
              value={form.watch('geofenceSettings')?.latitude || 0}
              onChange={(e) => updateGeofenceSetting('latitude', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              placeholder="106.8456"
              value={form.watch('geofenceSettings')?.longitude || 0}
              onChange={(e) => updateGeofenceSetting('longitude', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <Button 
          type="button" 
          onClick={handleSaveGeofenceSettings}
          disabled={!employeeId}
        >
          Simpan Pengaturan Geofence
        </Button>
      </div>
    );
  };

  // Memastikan data biometrik memiliki nilai default
  const ensureBiometricData = () => {
    const currentData = form.getValues('biometricData');
    if (!currentData) {
      const defaultData = {
        isActive: false,
        faceId: '',
        faceImageUrl: '',
        publicId: '',
        faceVector: [],
        registeredAt: '',
        lastUpdated: '',
      };
      form.setValue('biometricData', defaultData);
      return defaultData;
    }
    return currentData;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Data Biometrik Wajah</h3>
      
      <div className="flex justify-between items-center mb-4">
        <Label htmlFor="biometric-active">Aktifkan Biometrik</Label>
        <Switch
          id="biometric-active"
          checked={form.watch('biometricData')?.isActive || false}
          onCheckedChange={(checked) => {
            const data = ensureBiometricData();
            form.setValue('biometricData', { ...data, isActive: checked });
          }}
        />
      </div>
      
      <BiometricCapture />
      
      <h3 className="text-lg font-medium mt-6">Pengaturan Geofencing</h3>
      <GeofenceSettings />
    </div>
  );
};

export default BiometricDataFields;
