
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface TherapistFieldProps {
  control: Control<any>;
  isLoading: boolean;
  therapists: any[];
}

const TherapistField: React.FC<TherapistFieldProps> = ({ 
  control, 
  isLoading, 
  therapists 
}) => {
  return (
    <FormField
      control={control}
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
              {isLoading ? (
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
  );
};

export default TherapistField;
