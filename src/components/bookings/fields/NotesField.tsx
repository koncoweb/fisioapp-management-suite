
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';

interface NotesFieldProps {
  control: Control<any>;
}

const NotesField: React.FC<NotesFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Catatan Tambahan</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Tambahkan catatan jika diperlukan"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
