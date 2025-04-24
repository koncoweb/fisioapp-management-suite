import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { collection, query, where, getDocs, orderBy, limit, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookingSession } from '@/types';
import { Calendar, Users, Receipt } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch today's bookings
        if (userData) {
          let bookingsQuery;
          if (isAdmin) {
            bookingsQuery = query(
              collection(db, 'bookings'),
              where('date', '==', today),
              orderBy('startTime'),
              limit(5)
            );
          } else {
            bookingsQuery = query(
              collection(db, 'bookings'),
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
                clientName: data.clientName || '',
                clientPhone: data.clientPhone || '',
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
            
            setTodayBookings(bookingsData);
          } catch (error) {
            console.error('Error fetching bookings:', error);
            toast({
              title: "Error",
              description: "Failed to fetch bookings. Please check Firestore permissions.",
              variant: "destructive",
            });
          }

          // Fetch statistics if admin
          if (isAdmin) {
            try {
              const employeesSnapshot = await getDocs(collection(db, 'users'));
              const totalEmployees = employeesSnapshot.size;
              
              const allBookingsSnapshot = await getDocs(collection(db, 'bookings'));
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
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayBookings.length === 0 ? "No sessions scheduled" : "Sessions scheduled for today"}
            </p>
          </CardContent>
        </Card>
        
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Active staff members
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rp {stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time revenue
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Sessions</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "All therapy sessions scheduled for today" 
              : "Your therapy sessions scheduled for today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {todayBookings.length === 0 
                ? "No sessions scheduled for today" 
                : `Showing ${todayBookings.length} sessions for ${today}`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                {isAdmin && <TableHead>Therapist</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-6">
                    No bookings scheduled for today
                  </TableCell>
                </TableRow>
              ) : (
                todayBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </TableCell>
                    <TableCell>{booking.clientName}</TableCell>
                    <TableCell>{booking.serviceName}</TableCell>
                    {isAdmin && <TableCell>{booking.therapistName}</TableCell>}
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
