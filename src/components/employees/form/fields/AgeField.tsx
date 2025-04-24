
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../../EmployeeForm';

interface AgeFieldProps {
  form: UseFormReturn<EmployeeFormData>;
}

export const AgeField: React.FC<AgeFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="usia"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age</FormLabel>
          <FormControl>
            <Input {...field} type="number" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
