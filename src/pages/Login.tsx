
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, userData } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appTitle, setAppTitle] = useState('Fisioapp');
  const [appDescription, setAppDescription] = useState('Klinik Fisioterapi');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'appConfig', 'general'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setAppTitle(data.title || 'Fisioapp');
          setAppDescription(data.description || 'Klinik Fisioterapi');
          setLogoUrl(data.logoUrl || '');
        }
      } catch (error) {
        console.error('Error fetching app config:', error);
      }
    };

    fetchAppConfig();
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      
      // Get the redirect URL from session storage if it exists
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/';
      
      // Clear the redirect URL from session storage
      if (sessionStorage.getItem('redirectAfterLogin')) {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      
      // Use a small delay to ensure userData is updated
      setTimeout(() => {
        // Navigate to the intended URL or default based on role
        if (redirectPath && redirectPath !== '/login') {
          navigate(redirectPath, { replace: true });
        } else {
          // Default redirects based on role
          if (userData?.role === 'admin') {
            navigate('/dashboard', { replace: true });
          } else if (userData?.role === 'therapist') {
            navigate('/therapy-sessions', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error);
      // Clear any cached credentials on error
      sessionStorage.removeItem('redirectAfterLogin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            {logoUrl ? (
              <div className="flex justify-center mb-4">
                <img src={logoUrl} alt="Logo" className="h-16 w-auto" />
              </div>
            ) : null}
            <CardTitle className="text-2xl font-bold text-primary">{appTitle}</CardTitle>
            <CardDescription>{appDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="your.email@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="******" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
