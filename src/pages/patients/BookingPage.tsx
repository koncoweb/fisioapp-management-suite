
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import BookingForm from '@/components/bookings/BookingForm';
import BookingSummary from '@/components/bookings/BookingSummary';
import { TherapyService } from '@/types/booking';
import { Employee } from '@/types';
import { useTherapyServices } from '@/hooks/use-therapy-services';
import { useTherapists } from '@/hooks/use-therapists';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<TherapyService | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const { data: therapyServices, isLoading: isLoadingServices } = useTherapyServices();
  const { data: therapists, isLoading: isLoadingTherapists } = useTherapists();

  const handleServiceChange = (serviceId: string) => {
    const service = therapyServices?.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const handleSubmit = (values: any, service: TherapyService, therapist: Employee) => {
    try {
      const [hour, minute] = values.time.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hour, minute, 0);
      
      const endDate = new Date(startDate.getTime() + service.duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const bookingDetails = {
        patientId: values.patientId,
        patientName: values.patientName,
        therapistId: values.therapistId,
        therapistName: therapist.name,
        serviceId: values.serviceId,
        serviceName: service.name,
        date: format(values.date, 'yyyy-MM-dd'),
        startTime: values.time,
        endTime: endTime,
        status: 'pending',
        notes: values.notes || '',
        createdAt: new Date().toISOString(),
        duration: service.duration,
        isPackage: false, // Explicitly set isPackage
        packageIndex: null // Use null instead of undefined
      };

      setBookingData({
        ...bookingDetails,
        servicePrice: service.price,
        serviceDuration: service.duration
      });
      
      setShowSummary(true);
    } catch (error) {
      console.error("Error preparing booking:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses booking Anda.",
        variant: "destructive",
      });
    }
  };

  const confirmBooking = async () => {
    if (!bookingData) return;
    
    try {
      // Ensure we don't have any undefined values that Firebase will reject
      const bookingDataToSave = {
        ...bookingData,
        isPackage: bookingData.isPackage || false,
        packageIndex: bookingData.packageIndex ?? null, // Use null instead of undefined
        // Only include transactionId if it exists and is not undefined
        ...(bookingData.transactionId ? { transactionId: bookingData.transactionId } : {})
      };
      
      await addDoc(collection(db, 'therapySessions'), bookingDataToSave);
      
      toast({
        title: "Berhasil",
        description: "Jadwal terapi Anda sudah dibuat. Menunggu konfirmasi dari klinik.",
      });
      
      navigate('/patients');
    } catch (error) {
      console.error("Error creating therapy session:", error);
      toast({
        title: "Error",
        description: "Gagal membuat jadwal terapi. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  if (showSummary && bookingData) {
    return (
      <BookingSummary 
        booking={bookingData} 
        onConfirm={confirmBooking} 
        onBack={() => setShowSummary(false)} 
      />
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Buat Jadwal Terapi</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Terapi Baru</CardTitle>
          <CardDescription>
            Pilih jenis terapi, terapis, tanggal, dan waktu yang diinginkan
          </CardDescription>
        </CardHeader>
        
        <BookingForm 
          therapyServices={therapyServices}
          therapists={therapists}
          isLoadingServices={isLoadingServices}
          isLoadingTherapists={isLoadingTherapists}
          onServiceChange={handleServiceChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/patients')}
        />
      </Card>
    </div>
  );
};

export default BookingPage;
