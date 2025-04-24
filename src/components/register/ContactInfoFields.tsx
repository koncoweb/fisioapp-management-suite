
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/pages/Register";

interface ContactInfoFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export const ContactInfoFields = ({ form }: ContactInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="alamat"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat</FormLabel>
            <FormControl>
              <Input placeholder="Alamat lengkap" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pekerjaan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pekerjaan</FormLabel>
            <FormControl>
              <Input placeholder="Pekerjaan anda" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
