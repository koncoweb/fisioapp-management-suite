
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { UserData } from '@/contexts/AuthContext';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { BasicInfoFields } from './form/BasicInfoFields';
import { PersonalInfoFields } from './form/PersonalInfoFields';

export interface EmployeeFormData {
  namaLengkap: string;
  email: string;
  role: 'admin' | 'therapist' | 'karyawan';
  alamat: string;
  jenisKelamin: string;
  usia: number;
  password?: string;
}

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: UserData;
}

const employeeFormSchema = z.object({
  namaLengkap: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'therapist', 'karyawan']),
  alamat: z.string().min(5, 'Address must be at least 5 characters'),
  jenisKelamin: z.string().min(1, 'Please select a gender'),
  usia: z.number().min(18, 'Age must be at least 18'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, employee }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isExistingEmployee = !!employee;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      namaLengkap: '',
      email: '',
      role: 'karyawan',
      alamat: '',
      jenisKelamin: '',
      usia: 0,
      password: '',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        namaLengkap: employee.namaLengkap || '',
        email: employee.email || '',
        role: employee.role as 'admin' | 'therapist' | 'karyawan',
        alamat: employee.alamat || '',
        jenisKelamin: employee.jenisKelamin || '',
        usia: employee.usia || 0,
      });
    } else {
      form.reset({
        namaLengkap: '',
        email: '',
        role: 'karyawan',
        alamat: '',
        jenisKelamin: '',
        usia: 0,
        password: '',
      });
    }
  }, [employee, form]);

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      if (isExistingEmployee && employee) {
        // Update existing employee
        await updateDoc(doc(db, 'users', employee.uid), {
          namaLengkap: data.namaLengkap,
          role: data.role,
          alamat: data.alamat,
          jenisKelamin: data.jenisKelamin,
          usia: data.usia,
          updatedAt: new Date().toISOString(),
        });

        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Create new employee
        if (!data.password) {
          toast({
            title: "Error",
            description: "Password is required for new employees",
            variant: "destructive",
          });
          return;
        }

        // Create new user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        // Store user data in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: data.email,
          namaLengkap: data.namaLengkap,
          role: data.role,
          alamat: data.alamat,
          jenisKelamin: data.jenisKelamin,
          usia: data.usia,
          createdAt: new Date().toISOString(),
        });

        toast({
          title: "Success",
          description: "Employee created successfully",
        });

        form.reset();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isExistingEmployee ? 'Edit' : 'New'} Employee</SheetTitle>
          <SheetDescription>
            {isExistingEmployee 
              ? "Update employee information" 
              : "Add a new employee to the system"
            }
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <BasicInfoFields form={form} isExistingEmployee={isExistingEmployee} />
              
              {!isExistingEmployee && (
                <div className="form-field">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              )}
              
              <h3 className="text-lg font-medium">Personal Information</h3>
              <PersonalInfoFields form={form} />
            </div>
            
            <SheetFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Saving...' : isExistingEmployee ? 'Update' : 'Create'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeForm;
