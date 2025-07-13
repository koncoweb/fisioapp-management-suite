import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { TherapySession } from '@/types/therapySession';
import { User } from '@/types/user';
import { Product, ProductType } from '@/types/product';
import { addDoc, collection, query, where, getDocs, getDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { CalendarIcon, UserPlus, RefreshCw, Plus, CheckCircle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [isPackage, setIsPackage] = useState(false);
  const [packageIndex, setPackageIndex] = useState<number | undefined>(undefined);
  const [patientId, setPatientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [patients, setPatients] = useState<User[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    namaLengkap: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

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
          name: doc.data().name,
          email: doc.data().email,
          role: doc.data().role,
          phone: doc.data().phone,
          address: doc.data().address,
          photoURL: doc.data().photoURL,
          createdAt: doc.data().createdAt,
          updatedAt: doc.data().updatedAt,
          lastLogin: doc.data().lastLogin,
          isActive: doc.data().isActive,
          specialization: doc.data().specialization,
          notes: doc.data().notes
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
          createdAt: doc.data().createdAt || new Date().toISOString(),
          updatedAt: doc.data().updatedAt || new Date().toISOString(),
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
      // setDuration(selectedService.duration); // This line was removed
    }
  };

  const handleSearchPatient = () => {
    // Implementasi pencarian pasien, misal filter array atau fetch Firestore
  };

  const handleAddNewPatient = async () => {
    if (!newPatient.namaLengkap) {
      toast({
        title: 'Error',
        description: 'Nama lengkap pasien harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create new patient document in users collection with minimal information
      const newPatientRef = await addDoc(collection(db, 'users'), {
        namaLengkap: newPatient.namaLengkap,
        role: 'Pasien',
        createdAt: new Date().toISOString(),
      });

      // Add the new patient to the local state
      const newPatientData: User = {
        id: newPatientRef.id,
        name: newPatient.namaLengkap,
        email: '',
        role: 'patient',
        // tambahkan field lain jika perlu
      };
      setPatients([...patients, newPatientData]);

      // Set the patient ID to the newly created patient
      setPatientId(newPatientRef.id);

      // Reset the form
      setNewPatient({
        namaLengkap: ''
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
    
    if (!userData?.uid || !patientId || !serviceId) {
      toast({
        title: 'Error',
        description: 'Pasien dan layanan harus dipilih',
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

      const sessionData = {
        patientId,
        patientName: patientDoc.name,
        serviceId,
        serviceName: serviceDoc.name,
        therapistId: userData.uid,
        therapistName: userData.namaLengkap,
        status: 'pending',
        notes,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'therapySessions'), sessionData);
      
      toast({
        title: 'Sukses',
        description: 'Sesi terapi berhasil dicatat',
      });
      
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
                    <div className="flex justify-between items-center mb-1.5">
                      <Label htmlFor="patient">Pasien</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Cari pasien (min. 3 karakter)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="mb-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchPatient}
                          disabled={searchQuery.length < 3}
                        >
                          Cari
                        </Button>
                      </div>
                    </div>
                    {searchQuery.length > 0 && searchQuery.length < 3 && (
                      <p className="text-xs text-muted-foreground mt-1">Ketik minimal 3 karakter untuk pencarian</p>
                    )}
                    <Select value={patientId} onValueChange={setPatientId}>
                      <SelectTrigger id="patient">
                        <SelectValue placeholder="Pilih pasien" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.length > 0 ? (
                          patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="">Tidak ada pasien</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Layanan</Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
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
                </div>
                <Button type="submit" className="w-full">
                  Catat Sesi Terapi
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
                Daftar sesi terapi yang telah dicatat
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TherapySessionsPage;
