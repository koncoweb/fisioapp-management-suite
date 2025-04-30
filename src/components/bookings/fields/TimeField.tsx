
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface TimeFieldProps {
  control: Control<any>;
  availableTimeSlots: string[];
}

const TimeField: React.FC<TimeFieldProps> = ({ 
  control, 
  availableTimeSlots 
}) => {
  return (
    <FormField
      control={control}
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
  );
};

export default TimeField;
