import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Clock, MapPin, Check, X, RefreshCw, Menu } from 'lucide-react';
import { checkAttendance, getTodayAttendance } from '@/services/attendanceService';
import { getCurrentLocation } from '@/services/geofencingService';
import { useToast } from '@/hooks/use-toast';
import { Attendance } from '@/types/biometric';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const AttendancePage = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'check-in' | 'check-out'>('check-in');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [processingAttendance, setProcessingAttendance] = useState(false);
  const [attendanceResult, setAttendanceResult] = useState<Attendance | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memuat data absensi hari ini
  useEffect(() => {
    const loadTodayAttendance = async () => {
      if (!currentUser || !userData) return;
      
      try {
        const attendanceData = await getTodayAttendance(userData.uid);
        setTodayAttendance(attendanceData);
        
        // Menentukan tipe absensi (check-in/check-out) berdasarkan data yang ada
        const hasCheckIn = attendanceData.some(a => a.type === 'check-in' && a.status === 'valid');
        const hasCheckOut = attendanceData.some(a => a.type === 'check-out' && a.status === 'valid');
        
        if (hasCheckIn && !hasCheckOut) {
          setAttendanceType('check-out');
        }
      } catch (error) {
        console.error('Error loading today attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTodayAttendance();
  }, [currentUser, userData]);

  // Inisialisasi kamera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          // Gunakan pengaturan kamera yang sama dengan halaman biometrik
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
              frameRate: { ideal: 30 },
              aspectRatio: { ideal: 4/3 }
            }
          });
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

  // Mendapatkan lokasi pengguna
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        toast({
          title: "Error",
          description: "Gagal mendapatkan lokasi Anda. Mohon aktifkan layanan lokasi.",
          variant: "destructive",
        });
      }
    };
    
    getLocation();
  }, [toast]);

  // Fungsi untuk mengambil gambar
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !userLocation) {
      toast({
        title: "Error",
        description: "Data pengguna, kamera, atau lokasi tidak tersedia. Silakan coba lagi.",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context) return;

    // Set ukuran canvas sesuai dengan video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Gambar frame video ke canvas dengan efek mirror untuk konsistensi dengan BiometricDataPage
    // Flip horizontally for mirror effect
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Restore canvas context untuk menghindari masalah transformasi
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Konversi canvas ke file dengan kualitas yang lebih tinggi
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast({
          title: "Error",
          description: "Gagal mengambil gambar. Silakan coba lagi.",
          variant: "destructive",
        });
        return;
      }

      const imageFile = new File([blob], "attendance.jpg", { type: "image/jpeg" });

      try {
        setProcessingAttendance(true);
        
        // Pastikan userData.uid tersedia
        if (!userData.uid) {
          throw new Error('User ID tidak tersedia');
        }
        
        console.log('Processing attendance for user ID:', userData.uid);
        
        // Proses absensi menggunakan service yang sudah dioptimalkan
        // checkAttendance akan memanggil verifyFace yang sudah dioptimalkan di biometricService
        const result = await checkAttendance(
          userData.uid,
          attendanceType,
          imageFile,
          userLocation
        );
        
        setAttendanceResult(result);
        setTodayAttendance(prev => [result, ...prev]);
        
        toast({
          title: result.status === 'valid' ? "Berhasil" : "Verifikasi Diperlukan",
          description: result.status === 'valid' 
            ? `${attendanceType === 'check-in' ? 'Check-in' : 'Check-out'} berhasil` 
            : "Absensi Anda memerlukan verifikasi manual",
          variant: result.status === 'valid' ? "default" : "destructive",
        });
        
        // Matikan kamera setelah mengambil foto
        setIsCameraActive(false);
        if (videoRef.current?.srcObject instanceof MediaStream) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      } catch (error: any) {
        console.error('Error processing attendance:', error);
        toast({
          title: "Error",
          description: error.message || "Gagal memproses absensi",
          variant: "destructive",
        });
      } finally {
        setProcessingAttendance(false);
      }
    }, "image/jpeg", 0.95); // Tingkatkan kualitas gambar menjadi 95%
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 flex items-center justify-center h-[50vh] sm:h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 max-w-screen-lg">
      {/* Header dengan menu mobile */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Absensi</h1>
        
        {/* Menu desktop */}
        <div className="hidden sm:flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/attendance/rekap">Lihat Rekap Absensi</Link>
          </Button>
          {userData?.role === 'admin' && (
            <Button 
              onClick={() => navigate('/attendance/biometric')} 
              variant="outline"
            >
              Kelola Data Biometrik
            </Button>
          )}
        </div>
        
        {/* Menu mobile */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[385px]">
              <div className="flex flex-col space-y-3 mt-6">
                <Button variant="outline" asChild className="justify-start">
                  <Link to="/attendance/rekap">Lihat Rekap Absensi</Link>
                </Button>
                {userData?.role === 'admin' && (
                  <Button 
                    onClick={() => navigate('/attendance/biometric')} 
                    variant="outline"
                    className="justify-start"
                  >
                    Kelola Data Biometrik
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Konten utama - Responsif untuk mobile dan desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="w-full">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
            <CardTitle>Absensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="flex justify-center space-x-3 sm:space-x-4">
              <Button
                variant={attendanceType === 'check-in' ? 'default' : 'outline'}
                onClick={() => setAttendanceType('check-in')}
                disabled={
                  todayAttendance.some(a => a.type === 'check-in' && a.status === 'valid')
                }
                className="flex-1 sm:flex-none h-10 px-3 sm:h-10 sm:px-4"
                size="sm"
              >
                Check In
              </Button>
              <Button
                variant={attendanceType === 'check-out' ? 'default' : 'outline'}
                onClick={() => setAttendanceType('check-out')}
                disabled={
                  !todayAttendance.some(a => a.type === 'check-in')
                }
                className="flex-1 sm:flex-none h-10 px-3 sm:h-10 sm:px-4"
                size="sm"
              >
                Check Out
              </Button>
            </div>

            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="relative w-full aspect-[4/3] sm:aspect-video bg-muted rounded-lg overflow-hidden">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                      <Button 
                        onClick={captureImage}
                        disabled={!userLocation || processingAttendance}
                        className={`${
                          processingAttendance ? 'bg-gray-500' : 'bg-primary'
                        } text-white px-3 py-2 sm:px-4 rounded-full shadow-lg text-sm sm:text-base h-10`}
                        size="sm"
                      >
                        {processingAttendance ? (
                          <>
                            <RefreshCw className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Ambil Foto
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Button 
                      onClick={() => setIsCameraActive(true)}
                      disabled={processingAttendance}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Aktifkan Kamera
                    </Button>
                  </div>
                )}
              </div>
              
              {isCameraActive && (
                <div className="px-3 py-2 sm:px-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-xs sm:text-sm w-full rounded-r-sm">
                  <p className="font-medium mb-1">Tips untuk foto absensi yang baik:</p>
                  <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
                    <li>Pastikan wajah terlihat jelas dan pencahayaan cukup</li>
                    <li>Lepaskan masker atau aksesoris yang menutupi wajah</li>
                    <li>Jaga posisi kepala tegak dan ekspresi netral</li>
                  </ul>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {userLocation ? (
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Lokasi terdeteksi</span>
                </div>
              ) : (
                <div className="flex items-center text-xs sm:text-sm text-destructive">
                  <MapPin className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Lokasi tidak tersedia</span>
                </div>
              )}
            </div>

            {attendanceResult && (
              <div className={`p-3 sm:p-4 rounded-lg ${
                attendanceResult.status === 'valid' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {attendanceResult.status === 'valid' ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  <span className="font-medium text-sm sm:text-base">
                    {attendanceResult.status === 'valid' 
                      ? 'Absensi Tercatat' 
                      : 'Menunggu Verifikasi'}
                  </span>
                </div>
                <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Clock className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>
                      {new Date(attendanceResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {attendanceResult.notes && (
                    <p className="mt-0.5 sm:mt-1">{attendanceResult.notes}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
            <CardTitle>Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {todayAttendance.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {todayAttendance.map((record, index) => (
                  <div 
                    key={index} 
                    className={`p-2.5 sm:p-3 rounded-lg border ${
                      record.status === 'valid' 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm sm:text-base">
                        {record.type === 'check-in' ? 'Check In' : 'Check Out'}
                      </div>
                      <div className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                        record.status === 'valid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status === 'valid' ? 'Valid' : 'Menunggu'}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                      {format(new Date(record.timestamp), 'HH:mm:ss')}
                    </div>
                    {record.notes && (
                      <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-muted-foreground">
                        {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 sm:py-6 text-sm text-muted-foreground">
                Belum ada catatan absensi hari ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;
