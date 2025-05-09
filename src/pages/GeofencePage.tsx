import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, MapPin, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeofenceSettings } from '@/types/biometric';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCurrentLocation } from '@/services/geofencingService';

const GeofencePage: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings>({
    radius: 100,
    isRequired: true,
    locationName: '',
    latitude: 0,
    longitude: 0
  });
  
  // Memuat data geofence dari Firebase
  useEffect(() => {
    const loadGeofenceSettings = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          if (userData.geofenceSettings) {
            setGeofenceSettings(userData.geofenceSettings);
          }
        }
      } catch (error) {
        console.error('Error loading geofence settings:', error);
        toast({
          title: "Error",
          description: "Gagal memuat pengaturan geofence",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGeofenceSettings();
  }, [currentUser, toast]);
  
  // Fungsi untuk mendapatkan lokasi saat ini
  const getCurrentLocationHandler = async () => {
    try {
      const location = await getCurrentLocation();
      setGeofenceSettings(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude
      }));
      
      toast({
        title: "Sukses",
        description: "Berhasil mendapatkan lokasi saat ini",
        variant: "default",
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      toast({
        title: "Error",
        description: "Gagal mendapatkan lokasi saat ini. Pastikan layanan lokasi diaktifkan.",
        variant: "destructive",
      });
    }
  };
  
  // Fungsi untuk menyimpan pengaturan geofence
  const saveGeofenceSettings = async () => {
    if (!currentUser) return;
    
    try {
      setIsSaving(true);
      
      // Validasi input
      if (!geofenceSettings.locationName.trim()) {
        toast({
          title: "Error",
          description: "Nama lokasi tidak boleh kosong",
          variant: "destructive",
        });
        return;
      }
      
      if (geofenceSettings.radius <= 0) {
        toast({
          title: "Error",
          description: "Radius harus lebih besar dari 0",
          variant: "destructive",
        });
        return;
      }
      
      // Update data di Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        geofenceSettings: geofenceSettings
      });
      
      toast({
        title: "Sukses",
        description: "Pengaturan geofence berhasil disimpan",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving geofence settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan geofence",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Kembali ke halaman attendance
  const goToAttendance = () => {
    navigate('/attendance');
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pengaturan Geofence</h1>
        <Button variant="outline" onClick={goToAttendance}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Geofence</CardTitle>
          <CardDescription>
            Tentukan area geografis di mana absensi dapat dilakukan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="locationName">Nama Lokasi</Label>
                <Input
                  id="locationName"
                  placeholder="Contoh: Kantor Pusat"
                  value={geofenceSettings.locationName}
                  onChange={(e) => setGeofenceSettings(prev => ({
                    ...prev,
                    locationName: e.target.value
                  }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0000001"
                    value={geofenceSettings.latitude}
                    onChange={(e) => setGeofenceSettings(prev => ({
                      ...prev,
                      latitude: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0000001"
                    value={geofenceSettings.longitude}
                    onChange={(e) => setGeofenceSettings(prev => ({
                      ...prev,
                      longitude: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={getCurrentLocationHandler}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Gunakan Lokasi Saat Ini
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="radius">Radius (meter)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  value={geofenceSettings.radius}
                  onChange={(e) => setGeofenceSettings(prev => ({
                    ...prev,
                    radius: parseInt(e.target.value)
                  }))}
                />
                <p className="text-sm text-muted-foreground">
                  Radius menentukan jarak maksimal dari titik pusat di mana absensi masih dianggap valid
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isRequired"
                  checked={geofenceSettings.isRequired}
                  onCheckedChange={(checked) => setGeofenceSettings(prev => ({
                    ...prev,
                    isRequired: checked
                  }))}
                />
                <Label htmlFor="isRequired">Wajibkan Geofence untuk Absensi</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Jika diaktifkan, pengguna harus berada dalam radius geofence untuk melakukan absensi valid
              </p>
              
              <Button 
                onClick={saveGeofenceSettings} 
                className="w-full mt-6"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeofencePage;
