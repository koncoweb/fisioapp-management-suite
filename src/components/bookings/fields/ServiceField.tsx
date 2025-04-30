
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';

interface ServiceFieldProps {
  control: Control<any>;
  isLoading: boolean;
  services: any[];
  onChange: (serviceId: string) => void;
}

const ServiceField: React.FC<ServiceFieldProps> = ({ 
  control, 
  isLoading, 
  services, 
  onChange 
}) => {
  return (
    <FormField
      control={control}
      name="serviceId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Jenis Terapi</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value);
              onChange(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis terapi" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Memuat...</SelectItem>
              ) : services && services.length > 0 ? (
                services.map((service) => (
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
  );
};

export default ServiceField;
