
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../../EmployeeForm';

interface GenderFieldProps {
  form: UseFormReturn<EmployeeFormData>;
}

export const GenderField: React.FC<GenderFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="jenisKelamin"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Laki-laki">Male</SelectItem>
              <SelectItem value="Perempuan">Female</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
