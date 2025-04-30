
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DEFAULT_WORKING_HOURS, TherapyService } from '@/types/booking';
import BookingSummary from '@/components/bookings/BookingSummary';
import { Employee } from '@/types';

const bookingFormSchema = z.object({
  serviceId: z.string({ required_error: 'Jenis terapi harus dipilih' }),
  therapistId: z.string({ required_error: 'Terapis harus dipilih' }),
  date: z.date({ required_error: 'Tanggal harus dipilih' }),
  time: z.string({ required_error: 'Waktu harus dipilih' }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const BookingPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [selectedService, setSelectedService] = useState<TherapyService | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });

  const { data: therapyServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ['therapyServices'],
    queryFn: async () => {
      const q = query(
        collection(db, 'products'),
        where('type', '==', 'service')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TherapyService[];
    }
  });

  const { data: therapists, isLoading: isLoadingTherapists } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'therapist')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Employee[];
    }
  });

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    form.setValue('date', date);
    
    const dayOfWeek = date.getDay();
    if (!DEFAULT_WORKING_HOURS.days.includes(dayOfWeek)) {
      toast({
        title: "Hari Libur",
        description: "Klinik tutup pada hari ini. Silakan pilih hari kerja (Senin-Jumat).",
        variant: "destructive",
      });
      setAvailableTimeSlots([]);
      return;
    }
    
    const [startHour, startMinute] = DEFAULT_WORKING_HOURS.start.split(':').map(Number);
    const [endHour, endMinute] = DEFAULT_WORKING_HOURS.end.split(':').map(Number);
    
    const slots: string[] = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    setAvailableTimeSlots(slots);
  };

  const handleServiceChange = (serviceId: string) => {
    const service = therapyServices?.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const onSubmit = async (values: BookingFormValues) => {
    if (!userData || !selectedService) return;

    try {
      const service = therapyServices?.find(s => s.id === values.serviceId);
      const therapist = therapists?.find(t => t.id === values.therapistId);
      
      if (!service || !therapist) {
        toast({
          title: "Error",
          description: "Jenis terapi atau terapis tidak ditemukan.",
          variant: "destructive",
        });
        return;
      }

      const [hour, minute] = values.time.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hour, minute, 0);
      
      const endDate = new Date(startDate.getTime() + service.duration * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const bookingDetails = {
        patientId: userData.uid,
        patientName: userData.namaLengkap || userData.email,
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
      // Create bookingData without the transactionId field
      const bookingDataToSave = {
        ...bookingData,
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
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Terapi</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleServiceChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis terapi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingServices ? (
                            <SelectItem value="loading" disabled>Memuat...</SelectItem>
                          ) : therapyServices && therapyServices.length > 0 ? (
                            therapyServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - Rp {service.price.toLocaleString('id-ID')}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>Tidak ada jenis terapi</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="therapistId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terapis</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih terapis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTherapists ? (
                            <SelectItem value="loading" disabled>Memuat...</SelectItem>
                          ) : therapists && therapists.length > 0 ? (
                            therapists.map((therapist) => (
                              <SelectItem key={therapist.id} value={therapist.id}>
                                {therapist.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>Tidak ada terapis tersedia</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Terapi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: id })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => handleDateChange(date)}
                            disabled={(date) => {
                              const day = date.getDay();
                              const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
                              const isWorkingDay = DEFAULT_WORKING_HOURS.days.includes(day);
                              return isPastDate || !isWorkingDay;
                            }}
                            initialFocus
                            locale={id}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Terapi</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={availableTimeSlots.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih waktu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              Pilih tanggal terlebih dahulu
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Jam operasional: {DEFAULT_WORKING_HOURS.start} - {DEFAULT_WORKING_HOURS.end} (Senin - Jumat)
                </p>
              </div>

              <CardFooter className="px-0 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/patients')}
                  className="mr-2"
                >
                  Batal
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoadingServices || isLoadingTherapists}
                >
                  Buat Jadwal
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;
