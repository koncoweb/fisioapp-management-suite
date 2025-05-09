import React, { useRef, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, RefreshCw } from 'lucide-react';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Efek untuk menginisialisasi kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
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
      
      // Set ukuran canvas sesuai dengan video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Validasi ukuran video
      if (video.videoWidth < 100 || video.videoHeight < 100) {
        throw new Error('Resolusi kamera terlalu rendah. Minimal 100x100 piksel.');
      }
      
      // Gambar frame video ke canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Konversi canvas ke URL data
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewUrl(dataUrl);
      
      // Tampilkan pesan loading
      toast({
        title: "Memproses",
        description: "Sedang memproses gambar dan mendeteksi wajah...",
      });
      
      // Konversi dataURL ke File
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Gagal mengkonversi gambar');
        }
        
        const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
        await processBiometricImage(file);
      }, 'image/jpeg', 0.9); // Kualitas 90%
      
      // Matikan kamera setelah mengambil gambar
      setIsCameraActive(false);
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    } catch (error: any) {
      console.error('Error capturing image:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengambil gambar dari kamera",
        variant: "destructive",
      });
    }
  };
  
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
      
      toast({
        title: "Sukses",
        description: "Data biometrik berhasil disimpan",
      });
    } catch (error: any) {
      console.error('Error processing biometric data:', error);
      
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
                <div className="flex justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="max-w-full h-auto max-h-64 rounded-md"
                  />
                </div>
              ) : previewUrl ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto max-h-64 rounded-md"
                  />
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
