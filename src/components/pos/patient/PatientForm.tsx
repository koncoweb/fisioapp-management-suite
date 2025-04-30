
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types';
import { toast } from "sonner";

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

interface PatientFormProps {
  onCancel: () => void;
  onPatientAdded: (patient: Patient) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onCancel, onPatientAdded }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
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
  
  const onSubmit = async (data: PatientFormValues) => {
    setIsLoading(true);
    
    try {
      // Add new patient to firestore
      const patientRef = await addDoc(collection(db, 'patients'), {
        ...data,
        createdAt: serverTimestamp()
      });
      
      // Create the new patient with required fields
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
      onPatientAdded(newPatient);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Gagal menambahkan pasien baru");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
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
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Kembali
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Pasien'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;
