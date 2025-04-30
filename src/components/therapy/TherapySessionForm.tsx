
import React from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface TherapySessionFormData {
  bookingId: string;
  therapyType: string;
  duration: number;
  results: string;
  notes: string;
}

const TherapySessionForm = () => {
  const { toast } = useToast();
  const { userData } = useAuth();
  const form = useForm<TherapySessionFormData>();

  const onSubmit = async (data: TherapySessionFormData) => {
    try {
      const therapySession = {
        ...data,
        therapistId: userData?.uid,
        therapistName: userData?.namaLengkap,
        timestamp: new Date().toISOString(),
        isPackage: false,  // Explicitly set to false
        packageIndex: null // Use null instead of undefined
      };

      await addDoc(collection(db, 'therapySessions'), therapySession);

      toast({
        title: "Success",
        description: "Therapy session recorded successfully",
      });

      form.reset();
    } catch (error) {
      console.error('Error recording therapy session:', error);
      toast({
        title: "Error",
        description: "Failed to record therapy session",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bookingId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Booking ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter booking ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="therapyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Therapy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="massage">Massage Therapy</SelectItem>
                  <SelectItem value="physio">Physiotherapy</SelectItem>
                  <SelectItem value="acupuncture">Acupuncture</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0"
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="results"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Results</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Describe the therapy results and patient's progress"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Any additional notes or observations"
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Record Session
        </Button>
      </form>
    </Form>
  );
};

export default TherapySessionForm;
