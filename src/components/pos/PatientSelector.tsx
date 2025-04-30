
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, UserPlus, User } from 'lucide-react';
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define patient interface
interface Patient {
  id: string;
  nama: string;
  alamat: string;
  usia: number;
  keluhan?: string;
  telepon?: string;
  email?: string;
  riwayatMedis?: string;
  createdAt: any;
}

const patientSchema = z.object({
  nama: z.string().min(1, { message: "Nama harus diisi" }),
  alamat: z.string().min(1, { message: "Alamat harus diisi" }),
  usia: z.coerce.number().min(1, { message: "Usia harus diisi" }),
  keluhan: z.string().min(1, { message: "Keluhan harus diisi" }),
  telepon: z.string().optional(),
  email: z.string().email({ message: "Format email tidak valid" }).optional().or(z.literal('')),
  riwayatMedis: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({ isOpen, onClose, onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Set up form
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nama: '',
      alamat: '',
      usia: 0,
      keluhan: '',
      telepon: '',
      email: '',
      riwayatMedis: ''
    }
  });

  // Search for patients
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    
    try {
      // Search in firestore collection 'patients'
      const patientsRef = collection(db, 'patients');
      // Case-insensitive search for name containing the search query
      const q = query(
        patientsRef,
        where('nama', '>=', searchQuery),
        where('nama', '<=', searchQuery + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const patientResults: Patient[] = [];
      
      querySnapshot.forEach((doc) => {
        patientResults.push({
          id: doc.id,
          ...doc.data(),
        } as Patient);
      });
      
      setPatients(patientResults);
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Gagal mencari pasien");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new patient
  const onSubmit = async (data: PatientFormValues) => {
    setIsLoading(true);
    
    try {
      // Add new patient to firestore
      const patientRef = await addDoc(collection(db, 'patients'), {
        ...data,
        createdAt: serverTimestamp()
      });
      
      // Create the new patient with required fields
      // Fixed: Ensure we're assigning non-optional values to required fields
      const newPatient: Patient = {
        id: patientRef.id,
        nama: data.nama,
        alamat: data.alamat,
        usia: data.usia,
        keluhan: data.keluhan || '',
        telepon: data.telepon,
        email: data.email,
        riwayatMedis: data.riwayatMedis,
        createdAt: new Date()
      };
      
      toast.success("Pasien baru berhasil ditambahkan");
      onSelectPatient(newPatient);
      onClose();
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Gagal menambahkan pasien baru");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExistingPatient = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pilih Pasien</DialogTitle>
        </DialogHeader>
        
        {!isAddingNew ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pasien berdasarkan nama..."
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading} variant="default">
                  <Search className="h-4 w-4 mr-1" /> Cari
                </Button>
              </div>
              
              {isSearching && (
                <>
                  <div className="max-h-60 overflow-auto border rounded-md">
                    {patients.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        {isLoading ? 'Mencari...' : 'Tidak ada pasien ditemukan'}
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {patients.map((patient) => (
                          <li 
                            key={patient.id}
                            className="p-3 hover:bg-secondary/20 cursor-pointer transition-colors flex items-center"
                            onClick={() => selectExistingPatient(patient)}
                          >
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{patient.nama}</p>
                              <p className="text-xs text-muted-foreground">{patient.alamat}, {patient.usia} tahun</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" /> Tambah Pasien Baru
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap pasien" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Alamat lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="usia"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Usia<span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telepon"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>No. Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="Nomor telepon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="keluhan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keluhan<span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Keluhan pasien" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="riwayatMedis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Riwayat Medis</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Riwayat medis (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)}>
                  Kembali
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Pasien'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientSelector;
