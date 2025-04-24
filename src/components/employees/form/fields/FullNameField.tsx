
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../../EmployeeForm';

interface FullNameFieldProps {
  form: UseFormReturn<EmployeeFormData>;
}

export const FullNameField: React.FC<FullNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="namaLengkap"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Full Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
