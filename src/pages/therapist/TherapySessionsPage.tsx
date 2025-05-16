import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { TherapySession } from '@/types/therapySession';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, Clock, Package, Plus, RefreshCw, UserPlus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Patient {
  id: string;
  namaLengkap: string;
  email?: string;
  jenisKelamin?: string;
  usia?: string | number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  type?: string;
}

const TherapySessionsPage = () => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isPackage, setIsPackage] = useState(false);
  const [packageIndex, setPackageIndex] = useState<number | undefined>(undefined);
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    namaLengkap: '',
    email: '',
    jenisKelamin: '',
    usia: '',
    alamat: '',
  });

  // Fetch patients and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients from users collection with role Pasien/pasien
        const patientQuery = query(
          collection(db, 'users'),
          where('role', 'in', ['Pasien', 'pasien', 'patient', 'Patient'])
        );
        const patientsSnapshot = await getDocs(patientQuery);
        const patientsData = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          namaLengkap: doc.data().namaLengkap,
          email: doc.data().email,
          jenisKelamin: doc.data().jenisKelamin,
          usia: doc.data().usia,
        }));
        setPatients(patientsData);

        // Fetch services from products collection with type 'service'
        const serviceQuery = query(
          collection(db, 'products'),
          where('type', '==', 'service')
        );
        const servicesSnapshot = await getDocs(serviceQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          duration: doc.data().duration || 60, // Default to 60 minutes if not specified
          price: doc.data().price,
          type: doc.data().type,
        }));
        setServices(servicesData);

        // Fetch therapy sessions for the current therapist
        if (userData?.uid) {
          await fetchTherapySessions();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data. Silakan coba lagi.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [userData?.uid]);

  const fetchTherapySessions = async () => {
    if (!userData?.uid) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'therapySessions'),
        where('therapistId', '==', userData.uid)
      );
      
      const sessionsSnapshot = await getDocs(q);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TherapySession[];
      
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching therapy sessions:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (value: string) => {
    setServiceId(value);
    
    // Set duration based on selected service
    const selectedService = services.find(service => service.id === value);
    if (selectedService) {
      setDuration(selectedService.duration);
    }
  };

  const handleAddNewPatient = async () => {
    if (!newPatient.namaLengkap || !newPatient.email) {
      toast({
        title: 'Error',
        description: 'Nama dan email pasien harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create new patient document in users collection
      const newPatientRef = await addDoc(collection(db, 'users'), {
        namaLengkap: newPatient.namaLengkap,
        email: newPatient.email,
        jenisKelamin: newPatient.jenisKelamin,
        usia: newPatient.usia,
        alamat: newPatient.alamat,
        role: 'Pasien',
        createdAt: new Date().toISOString(),
      });

      // Add the new patient to the local state
      const newPatientData = {
        id: newPatientRef.id,
        namaLengkap: newPatient.namaLengkap,
        email: newPatient.email,
        jenisKelamin: newPatient.jenisKelamin,
        usia: newPatient.usia,
      };
      setPatients([...patients, newPatientData]);

      // Set the patient ID to the newly created patient
      setPatientId(newPatientRef.id);

      // Reset the form
      setNewPatient({
        namaLengkap: '',
        email: '',
        jenisKelamin: '',
        usia: '',
        alamat: '',
      });
      setShowAddPatientForm(false);

      toast({
        title: 'Sukses',
        description: 'Pasien baru berhasil ditambahkan',
      });
    } catch (error) {
      console.error('Error adding new patient:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan pasien baru. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.uid || !patientId || !serviceId || !date || !time) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Get patient name
      const patientDoc = patients.find(p => p.id === patientId);
      if (!patientDoc) {
        throw new Error('Pasien tidak ditemukan');
      }

      // Get service name
      const serviceDoc = services.find(s => s.id === serviceId);
      if (!serviceDoc) {
        throw new Error('Layanan tidak ditemukan');
      }

      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const sessionData = {
        patientId,
        patientName: patientDoc.namaLengkap,
        serviceId,
        serviceName: serviceDoc.name,
        therapistId: userData.uid,
        therapistName: userData.namaLengkap,
        date: formattedDate,
        time,
        duration,
        isPackage,
        ...(isPackage && packageIndex !== undefined ? { packageIndex } : {}),
        status: 'pending',
        notes,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'therapySessions'), sessionData);
      
      toast({
        title: 'Sukses',
        description: 'Sesi terapi berhasil dicatat',
      });
      
      // Reset form
      setPatientId('');
      setServiceId('');
      setDate(new Date());
      setTime('');
      setDuration(60);
      setIsPackage(false);
      setPackageIndex(undefined);
      setNotes('');
      
      // Refresh sessions list
      await fetchTherapySessions();
      
      // Switch to list tab
      setActiveTab('list');
    } catch (error: any) {
      console.error('Error submitting therapy session:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal mencatat sesi terapi. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Menunggu Konfirmasi</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Dikonfirmasi</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Pencatatan Sesi Terapi</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="create">Catat Sesi Baru</TabsTrigger>
          <TabsTrigger value="list">Daftar Sesi Terapi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Catat Sesi Terapi Baru</CardTitle>
              <CardDescription>
                Isi form berikut untuk mencatat sesi terapi yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="patient">Pasien</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddPatientForm(!showAddPatientForm)}
                      >
                        {showAddPatientForm ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Batal
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Pasien Baru
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {!showAddPatientForm ? (
                      <Select value={patientId} onValueChange={setPatientId}>
                        <SelectTrigger id="patient">
                          <SelectValue placeholder="Pilih pasien" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length > 0 ? (
                            patients.map(patient => (
                              <SelectItem key={patient.id} value={patient.id}>
                                {patient.namaLengkap} {patient.usia ? `(${patient.usia} tahun)` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-patients" disabled>
                              Tidak ada pasien tersedia
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-3 border p-3 rounded-md">
                        <div>
                          <Label htmlFor="newPatientName">Nama Lengkap</Label>
                          <Input
                            id="newPatientName"
                            value={newPatient.namaLengkap}
                            onChange={(e) => setNewPatient({...newPatient, namaLengkap: e.target.value})}
                            placeholder="Nama lengkap pasien"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newPatientEmail">Email</Label>
                          <Input
                            id="newPatientEmail"
                            type="email"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                            placeholder="Email pasien"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="newPatientGender">Jenis Kelamin</Label>
                            <Select 
                              value={newPatient.jenisKelamin} 
                              onValueChange={(value) => setNewPatient({...newPatient, jenisKelamin: value})}
                            >
                              <SelectTrigger id="newPatientGender">
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="newPatientAge">Usia</Label>
                            <Input
                              id="newPatientAge"
                              type="number"
                              value={newPatient.usia}
                              onChange={(e) => setNewPatient({...newPatient, usia: e.target.value})}
                              placeholder="Usia pasien"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newPatientAddress">Alamat</Label>
                          <Textarea
                            id="newPatientAddress"
                            value={newPatient.alamat}
                            onChange={(e) => setNewPatient({...newPatient, alamat: e.target.value})}
                            placeholder="Alamat pasien"
                          />
                        </div>
                        <Button 
                          type="button" 
                          className="w-full"
                          onClick={handleAddNewPatient}
                          disabled={!newPatient.namaLengkap || !newPatient.email}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah Pasien
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service">Layanan</Label>
                    <Select value={serviceId} onValueChange={handleServiceChange}>
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Waktu</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durasi (menit)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="isPackage"
                      checked={isPackage}
                      onCheckedChange={(checked) => {
                        setIsPackage(checked === true);
                        if (checked === false) {
                          setPackageIndex(undefined);
                        }
                      }}
                    />
                    <Label htmlFor="isPackage">Bagian dari paket</Label>
                  </div>
                </div>
                
                {isPackage && (
                  <div className="space-y-2">
                    <Label htmlFor="packageIndex">Sesi ke-</Label>
                    <Input
                      id="packageIndex"
                      type="number"
                      min="1"
                      value={packageIndex || ''}
                      onChange={(e) => setPackageIndex(parseInt(e.target.value))}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan tentang sesi terapi ini"
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Sesi Terapi'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Sesi Terapi</CardTitle>
              <CardDescription>
                Daftar sesi terapi yang telah Anda catat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Memuat data...</div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-4">Belum ada sesi terapi yang dicatat</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>{session.date}</TableCell>
                          <TableCell>{session.time}</TableCell>
                          <TableCell>{session.patientName}</TableCell>
                          <TableCell>{session.serviceName}</TableCell>
                          <TableCell>{session.duration} menit</TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapySessionsPage;
