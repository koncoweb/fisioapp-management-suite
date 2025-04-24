
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/pages/Register";

interface InsuranceFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export const InsuranceFields = ({ form }: InsuranceFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nomorBPJS"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor BPJS (Opsional)</FormLabel>
            <FormControl>
              <Input placeholder="Nomor BPJS" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nomorAsuransiLain"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nomor Asuransi Lain (Opsional)</FormLabel>
            <FormControl>
              <Input placeholder="Nomor asuransi lain" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
