
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore';
import type { BookingSession } from '@/types';
import { DashboardStats } from '@/components/dashboard/StatsCards';
import BookingsTable from '@/components/dashboard/BookingsTable';
import TherapistView from '@/components/dashboard/TherapistView';

const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const [todayBookings, setTodayBookings] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEmployees: 0,
    totalRevenue: 0,
  });
  const { toast } = useToast();

  const isAdmin = userData?.role === 'admin';
  const isTherapist = userData?.role === 'therapist';
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        if (userData) {
          let bookingsQuery;
          if (isAdmin) {
            bookingsQuery = query(
              collection(db, 'therapySessions'),
              where('date', '==', today),
              orderBy('startTime'),
              limit(5)
            );
          } else {
            bookingsQuery = query(
              collection(db, 'therapySessions'),
              where('date', '==', today),
              where('therapistId', '==', userData?.uid || ''),
              orderBy('startTime'),
              limit(5)
            );
          }
          
          try {
            const bookingsSnapshot = await getDocs(bookingsQuery);
            const bookingsData: BookingSession[] = [];
            
            bookingsSnapshot.forEach((doc) => {
              const data = doc.data() as DocumentData;
              bookingsData.push({ 
                id: doc.id, 
                clientName: data.patientName || '',
                clientPhone: data.patientPhone || '',
                serviceName: data.serviceName || '',
                serviceId: data.serviceId || '',
                therapistName: data.therapistName || '',
                therapistId: data.therapistId || '',
                date: data.date || '',
                startTime: data.startTime || '',
                endTime: data.endTime || '',
                status: data.status || 'pending',
                notes: data.notes || '',
                createdAt: data.createdAt || ''
              });
            });
            
            setTodayBookings(bookingsData);
          } catch (error) {
            console.error('Error fetching therapy sessions:', error);
            toast({
              title: "Error",
              description: "Failed to fetch therapy sessions. Please check Firestore permissions.",
              variant: "destructive",
            });
          }

          if (isAdmin) {
            try {
              const employeesSnapshot = await getDocs(collection(db, 'users'));
              const totalEmployees = employeesSnapshot.size;
              
              const allBookingsSnapshot = await getDocs(collection(db, 'therapySessions'));
              const totalBookings = allBookingsSnapshot.size;
              
              const paymentsSnapshot = await getDocs(collection(db, 'payments'));
              let totalRevenue = 0;
              paymentsSnapshot.forEach((doc) => {
                const data = doc.data();
                totalRevenue += data.amount || 0;
              });
              
              setStats({
                totalBookings,
                totalEmployees,
                totalRevenue,
              });
            } catch (error) {
              console.error('Error fetching admin stats:', error);
              toast({
                title: "Error",
                description: "Failed to fetch statistics. Please check Firestore permissions.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [userData, isAdmin, today, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-2">Memuat dashboard...</p>
      </div>
    );
  }

  if (isTherapist) {
    return <TherapistView todayBookings={todayBookings} today={today} />;
  }

  return (
    <div className="space-y-6">
      <DashboardStats
        todayBookings={todayBookings.length}
        totalEmployees={stats.totalEmployees}
        totalRevenue={stats.totalRevenue}
        isAdmin={isAdmin}
      />
      <div className="mt-6">
        <BookingsTable
          bookings={todayBookings}
          date={today}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default Dashboard;
