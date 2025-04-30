
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateTimeSlots, isDateDisabled } from './BookingFormUtils';
import { DEFAULT_WORKING_HOURS } from '@/types/booking';
import ServiceField from './fields/ServiceField';
import TherapistField from './fields/TherapistField';
import DateField from './fields/DateField';
import TimeField from './fields/TimeField';
import NotesField from './fields/NotesField';

const bookingFormSchema = z.object({
  serviceId: z.string({ required_error: 'Jenis terapi harus dipilih' }),
  therapistId: z.string({ required_error: 'Terapis harus dipilih' }),
  date: z.date({ required_error: 'Tanggal harus dipilih' }),
  time: z.string({ required_error: 'Waktu harus dipilih' }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  therapyServices: any[];
  therapists: any[];
  isLoadingServices: boolean;
  isLoadingTherapists: boolean;
  onServiceChange: (serviceId: string) => void;
  onSubmit: (values: any, service: any, therapist: any) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  therapyServices,
  therapists,
  isLoadingServices,
  isLoadingTherapists,
  onServiceChange,
  onSubmit,
  onCancel
}) => {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
  });

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    form.setValue('date', date);
    const slots = generateTimeSlots(date, toast);
    setAvailableTimeSlots(slots);
  };

  const handleSubmitForm = (values: BookingFormValues) => {
    if (!userData) return;

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

      onSubmit({
        ...values,
        patientId: userData.uid,
        patientName: userData.namaLengkap || userData.email,
      }, service, therapist);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses formulir.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceField 
              control={form.control} 
              isLoading={isLoadingServices}
              services={therapyServices}
              onChange={onServiceChange}
            />

            <TherapistField 
              control={form.control}
              isLoading={isLoadingTherapists}
              therapists={therapists}
            />

            <DateField 
              control={form.control}
              onChange={handleDateChange}
              isDateDisabled={isDateDisabled}
            />

            <TimeField 
              control={form.control}
              availableTimeSlots={availableTimeSlots}
            />
          </div>

          <NotesField control={form.control} />

          <div className="text-sm text-muted-foreground">
            <p className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Jam operasional: {DEFAULT_WORKING_HOURS.start} - {DEFAULT_WORKING_HOURS.end} (Senin - Jumat)
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
  );
};

export default BookingForm;
