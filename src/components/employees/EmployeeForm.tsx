
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserData } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BasicInfoFields } from './form/BasicInfoFields';
import { PersonalInfoFields } from './form/PersonalInfoFields';

// Define the allowed roles for employees
type EmployeeRole = "admin" | "therapist" | "karyawan";

const employeeFormSchema = z.object({
  namaLengkap: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "therapist", "karyawan"]),
  alamat: z.string().optional(),
  jenisKelamin: z.string().optional(),
  usia: z.string().optional(),
  pekerjaan: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: UserData;
}

const EmployeeForm = ({ isOpen, onClose, employee }: EmployeeFormProps) => {
  const { toast } = useToast();
  
  const getValidRole = (role?: string): EmployeeRole => {
    if (role === "admin" || role === "therapist" || role === "karyawan") {
      return role as EmployeeRole;
    }
    return "karyawan";
  };
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      namaLengkap: employee?.namaLengkap || "",
      email: employee?.email || "",
      role: getValidRole(employee?.role),
      alamat: employee?.alamat || "",
      jenisKelamin: employee?.jenisKelamin || "",
      usia: employee?.usia || "",
      pekerjaan: employee?.pekerjaan || "",
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (employee?.uid) {
        await updateDoc(doc(db, "users", employee.uid), data);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Creating new users directly is not supported. Please use the registration flow.",
          variant: "destructive",
        });
        return;
      }
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: "Failed to save employee data",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFields form={form} isExistingEmployee={!!employee} />
            <PersonalInfoFields form={form} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeForm;
