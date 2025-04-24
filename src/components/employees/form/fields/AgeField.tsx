
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
            <Input 
              type="number" 
              {...field} 
              onChange={(e) => {
                // Convert the string value to a number before updating the form
                const value = e.target.value ? parseInt(e.target.value, 10) : 0;
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
