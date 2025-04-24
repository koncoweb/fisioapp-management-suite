
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { EmployeeFormData } from '../../EmployeeForm';

interface EmailFieldProps {
  form: UseFormReturn<EmployeeFormData>;
  isExistingEmployee: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ form, isExistingEmployee }) => {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} type="email" readOnly={isExistingEmployee} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
