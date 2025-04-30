
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, DocumentData, Timestamp } from 'firebase/firestore';
import type { BookingSession } from '@/types';
import { DashboardStats } from '@/components/dashboard/StatsCards';
import BookingsTable from '@/components/dashboard/BookingsTable';
import TherapistView from '@/components/dashboard/TherapistView';
import { startOfDay, endOfDay } from 'date-fns';

const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const [todayBookings, setTodayBookings] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayIncome: 0,
    todayExpenses: 0,
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
              limit(5)
            );
          } else {
            bookingsQuery = query(
              collection(db, 'therapySessions'),
              where('date', '==', today),
              where('therapistId', '==', userData?.uid || ''),
              limit(5)
            );
          }
          
          try {
            const bookingsSnapshot = await getDocs(bookingsQuery);
            let bookingsData: BookingSession[] = [];
            
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
                status: data.status || 'scheduled',
                notes: data.notes || '',
                createdAt: data.createdAt || ''
              });
            });
            
            // Sort data manually after fetching
            bookingsData.sort((a, b) => {
              if (a.startTime < b.startTime) return -1;
              if (a.startTime > b.startTime) return 1;
              return 0;
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
              // Get today's start and end timestamps for financial data filtering
              const todayStart = startOfDay(new Date());
              const todayEnd = endOfDay(new Date());
              
              // Fetch today's income (transactions)
              const transactionsQuery = query(
                collection(db, 'transactions'),
                where('transactionDate', '>=', todayStart),
                where('transactionDate', '<=', todayEnd)
              );
              
              // Fetch today's expenses
              const expensesQuery = query(
                collection(db, 'expenses'),
                where('date', '>=', todayStart),
                where('date', '<=', todayEnd)
              );
              
              const [transactionsSnapshot, expensesSnapshot] = await Promise.all([
                getDocs(transactionsQuery),
                getDocs(expensesQuery)
              ]);
              
              // Calculate today's income
              let todayIncome = 0;
              transactionsSnapshot.forEach((doc) => {
                const data = doc.data();
                todayIncome += data.total || 0;
              });
              
              // Calculate today's expenses
              let todayExpenses = 0;
              expensesSnapshot.forEach((doc) => {
                const data = doc.data();
                todayExpenses += data.amount || 0;
              });
              
              setStats({
                todayIncome,
                todayExpenses,
              });
            } catch (error) {
              console.error('Error fetching financial stats:', error);
              toast({
                title: "Error",
                description: "Failed to fetch financial statistics.",
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
        todayIncome={stats.todayIncome}
        todayExpenses={stats.todayExpenses}
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
