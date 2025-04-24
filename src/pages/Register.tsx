
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PersonalInfoFields } from '@/components/register/PersonalInfoFields';
import { ContactInfoFields } from '@/components/register/ContactInfoFields';
import { InsuranceFields } from '@/components/register/InsuranceFields';
import { PasswordFields } from '@/components/register/PasswordFields';

const registerSchema = z.object({
  namaLengkap: z.string().min(2, { message: 'Nama harus minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  confirmPassword: z.string().min(6, { message: 'Konfirmasi password minimal 6 karakter' }),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']),
  usia: z.string().min(1, { message: 'Usia harus diisi' }),
  alamat: z.string().min(1, { message: 'Alamat harus diisi' }),
  pekerjaan: z.string().min(1, { message: 'Pekerjaan harus diisi' }),
  nomorBPJS: z.string().optional(),
  nomorAsuransiLain: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords tidak sama",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      namaLengkap: '',
      email: '',
      password: '',
      confirmPassword: '',
      jenisKelamin: 'Laki-laki',
      usia: '',
      alamat: '',
      pekerjaan: '',
      nomorBPJS: '',
      nomorAsuransiLain: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await register(data.email, data.password, data.namaLengkap, 'Pasien', {
        alamat: data.alamat,
        jenisKelamin: data.jenisKelamin,
        usia: data.usia,
        pekerjaan: data.pekerjaan,
        nomorBPJS: data.nomorBPJS || '',
        nomorAsuransiLain: data.nomorAsuransiLain || '',
      });
      toast({
        title: "Registrasi berhasil",
        description: "Akun anda telah dibuat. Silahkan login.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Fisioapp</CardTitle>
            <CardDescription>Daftar akun baru</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <PersonalInfoFields form={form} />
                <ContactInfoFields form={form} />
                <InsuranceFields form={form} />
                <PasswordFields form={form} />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mendaftar...' : 'Daftar'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
