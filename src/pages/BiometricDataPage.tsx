import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, UserPlus, RefreshCw, Trash2, Camera, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BiometricData } from '@/types/biometric';
import { getUsersList, getUserBiometricData, deleteBiometricData } from '@/services/biometricService';
import { UserData } from '@/contexts/AuthContext';

// Definisi tipe untuk pengguna dengan data biometrik
type UserWithBiometricData = UserData & {
  // Properti tambahan jika diperlukan
}

const BiometricDataPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithBiometricData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithBiometricData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithBiometricData | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState<boolean | null>(null);
  const [captureMessage, setCaptureMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load face-api models menggunakan service yang sudah dioptimalkan
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Gunakan fungsi loadFaceApiModels dari biometricService
        // yang sudah dioptimalkan untuk mencegah pemuatan berulang
        const biometricService = await import('@/services/biometricService');
        await biometricService.loadFaceApiModels();
        
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading Face-API models:', error);
        toast({
          title: "Error",
          description: "Gagal memuat model pengenalan wajah. Silakan refresh halaman.",
          variant: "destructive",
        });
      }
    };
    
    loadModels();
    
    // Cleanup function
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  // Load users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const usersList = await getUsersList();
        setUsers(usersList);
        setFilteredUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar pengguna",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, toast]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.namaLengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  // Setup camera
  const setupCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isCameraActive) {
        // Stop camera
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
      } else {
        // Start camera dengan pengaturan yang konsisten
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            // Tambahan pengaturan untuk konsistensi
            frameRate: { ideal: 30 },
            aspectRatio: { ideal: 4/3 }
          } 
        });
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Error",
        description: "Gagal mengakses kamera. Pastikan kamera Anda terhubung dan izin diberikan.",
        variant: "destructive",
      });
    }
  };
  
  // Capture image for face recognition
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedUser) {
      toast({
        title: "Error",
        description: "Kamera atau pengguna tidak tersedia",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCapturing(true);
      setCaptureSuccess(null);
      setCaptureMessage('');
      
      // Draw video frame to canvas
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Flip horizontally for mirror effect
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Restore canvas context untuk menghindari masalah transformasi
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCaptureSuccess(false);
          setCaptureMessage('Gagal mengambil gambar');
          return;
        }
        
        // Create file from blob
        const imageFile = new File([blob], `face-${selectedUser.uid}.jpg`, { type: 'image/jpeg' });
        
        try {
          // Import biometric service yang sudah dioptimalkan
          const biometricService = await import('@/services/biometricService');
          
          // Gunakan service untuk memproses dan menyimpan data biometrik
          // Service ini sudah termasuk deteksi wajah yang dioptimalkan dengan preprocessing
          await biometricService.saveBiometricData(selectedUser.uid, imageFile);
          
          // Refresh user data
          const updatedUserData = await getUserBiometricData(selectedUser.uid);
          
          // Update users list
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.uid === selectedUser.uid 
                ? { ...user, biometricData: updatedUserData.biometricData } 
                : user
            )
          );
          
          // Update selected user
          setSelectedUser(prev => prev ? { ...prev, biometricData: updatedUserData.biometricData } : null);
          
          setCaptureSuccess(true);
          setCaptureMessage('Data biometrik berhasil disimpan');
          
          toast({
            title: "Sukses",
            description: "Data biometrik berhasil disimpan",
          });
        } catch (error: any) {
          console.error('Error saving biometric data:', error);
          setCaptureSuccess(false);
          
          // Tampilkan pesan error yang lebih spesifik
          const errorMessage = error.message || 'Gagal menyimpan data biometrik';
          setCaptureMessage(errorMessage);
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }, 'image/jpeg', 0.95); // Tingkatkan kualitas gambar menjadi 95%
    } catch (error: any) {
      console.error('Error capturing image:', error);
      setCaptureSuccess(false);
      
      // Tampilkan pesan error yang lebih spesifik
      const errorMessage = error.message || 'Gagal memproses gambar';
      setCaptureMessage(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Delete biometric data
  const handleDeleteBiometricData = async (userId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data biometrik pengguna ini?')) {
      return;
    }
    
    try {
      await deleteBiometricData(userId);
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.uid === userId 
            ? { ...user, biometricData: undefined } 
            : user
        )
      );
      
      // Update selected user if it's the same
      if (selectedUser?.uid === userId) {
        setSelectedUser(prev => prev ? { ...prev, biometricData: undefined } : null);
      }
      
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
    }
  };
  
  // Select user for biometric registration
  const handleSelectUser = (user: UserWithBiometricData) => {
    setSelectedUser(user);
    setIsCameraActive(false);
    setCaptureSuccess(null);
    setCaptureMessage('');
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  // Navigate to attendance page
  const goToAttendance = () => {
    navigate('/attendance');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Data Biometrik</h1>
        <Button onClick={goToAttendance} variant="outline">
          Kembali ke Absensi
        </Button>
      </div>
      
      <Tabs defaultValue="users-list">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users-list">Daftar Pengguna</TabsTrigger>
          <TabsTrigger value="register-biometric" disabled={!selectedUser}>
            {selectedUser ? `Register Biometrik: ${selectedUser.namaLengkap}` : 'Register Biometrik'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users-list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>
                Kelola data biometrik wajah untuk semua pengguna
              </CardDescription>
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari pengguna..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status Biometrik</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.uid}>
                          <TableCell className="font-medium">{user.namaLengkap}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            {user.biometricData ? (
                              <div className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-2" />
                                <span>Terdaftar</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <X className="h-4 w-4 text-red-500 mr-2" />
                                <span>Belum Terdaftar</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectUser(user)}
                              >
                                {user.biometricData ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Update
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Daftarkan
                                  </>
                                )}
                              </Button>
                              
                              {user.biometricData && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBiometricData(user.uid)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada pengguna yang tersedia'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="register-biometric">
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      {selectedUser.namaLengkap}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      {selectedUser.email}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="p-2 border rounded-md bg-muted/50">
                      {selectedUser.role}
                    </div>
                  </div>
                  
                  {selectedUser.biometricData && (
                    <div className="space-y-2">
                      <Label>Status Biometrik</Label>
                      <div className="p-2 border rounded-md bg-green-50 text-green-700 flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Terdaftar pada {new Date(selectedUser.biometricData.registeredAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.biometricData && (
                    <div className="space-y-2">
                      <Label>Gambar Referensi</Label>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={selectedUser.biometricData.faceImageUrl} 
                          alt="Face Reference" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedUser.biometricData 
                      ? 'Update Data Biometrik' 
                      : 'Daftarkan Data Biometrik'}
                  </CardTitle>
                  <CardDescription>
                    Pastikan wajah terlihat jelas dan pencahayaan baik
                  </CardDescription>
                </CardHeader>
                {isCameraActive && (
                  <div className="px-6 py-2 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-sm">
                    <h4 className="font-medium mb-1">Tips untuk hasil terbaik:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Pastikan wajah berada di tengah frame</li>
                      <li>Gunakan pencahayaan yang cukup (hindari backlight/cahaya dari belakang)</li>
                      <li>Lepaskan masker, kacamata, atau aksesoris yang menutupi wajah</li>
                      <li>Jaga posisi kepala tegak dan ekspresi netral</li>
                    </ul>
                  </div>
                )}
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <Button 
                      onClick={setupCamera} 
                      variant={isCameraActive ? "destructive" : "default"}
                      disabled={!modelsLoaded}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {isCameraActive ? 'Matikan Kamera' : 'Aktifkan Kamera'}
                    </Button>
                  </div>
                  
                  <div className="relative rounded-md overflow-hidden border">
                    {!modelsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <Loader2 className="h-8 w-8 animate-spin mr-2" />
                        <span>Memuat model pengenalan wajah...</span>
                      </div>
                    )}
                    
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-auto ${isCameraActive ? 'block' : 'hidden'}`}
                      style={{ transform: 'scaleX(-1)' }} // Mirror effect
                    />
                    
                    {!isCameraActive && (
                      <div className="bg-muted/20 w-full aspect-video flex items-center justify-center">
                        <div className="text-center p-4">
                          <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-muted-foreground">
                            Aktifkan kamera untuk mengambil gambar wajah
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  {isCameraActive && (
                    <Button 
                      onClick={captureImage} 
                      className="w-full" 
                      disabled={isCapturing || !modelsLoaded}
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Ambil Gambar
                        </>
                      )}
                    </Button>
                  )}
                  
                  {captureMessage && (
                    <div className={`p-3 rounded-md ${
                      captureSuccess 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {captureSuccess ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        <span>{captureMessage}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BiometricDataPage;
