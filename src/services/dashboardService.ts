import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { DashboardStats } from '@/types/dashboard';
import { subMonths, startOfMonth, endOfMonth, format, subDays } from 'date-fns';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const sixMonthsAgo = subMonths(now, 5);
  
  // Helper function to get start of month
  const getMonthStart = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  try {
    // 1. Fetch revenue data (from transactions)
    const transactionsRef = collection(db, 'transactions');
    const currentMonthTransactions = await getDocs(
      query(
        transactionsRef,
        where('date', '>=', Timestamp.fromDate(currentMonthStart)),
        where('date', '<=', Timestamp.fromDate(now))
      )
    );
    
    const lastMonthTransactions = await getDocs(
      query(
        transactionsRef,
        where('date', '>=', Timestamp.fromDate(lastMonthStart)),
        where('date', '<', Timestamp.fromDate(currentMonthStart))
      )
    );

    // Calculate revenue
    const currentMonthRevenue = currentMonthTransactions.docs.reduce(
      (sum, doc) => sum + (doc.data().total || 0), 0
    );
    
    const lastMonthRevenue = lastMonthTransactions.docs.reduce(
      (sum, doc) => sum + (doc.data().total || 0), 0
    );
    
    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // 2. Fetch therapy sessions
    const sessionsRef = collection(db, 'therapySessions');
    const currentMonthSessions = await getDocs(
      query(
        sessionsRef,
        where('date', '>=', format(currentMonthStart, 'yyyy-MM-dd')),
        where('date', '<=', format(now, 'yyyy-MM-dd'))
      )
    );
    
    const lastMonthSessions = await getDocs(
      query(
        sessionsRef,
        where('date', '>=', format(lastMonthStart, 'yyyy-MM-dd')),
        where('date', '<', format(currentMonthStart, 'yyyy-MM-dd'))
      )
    );
    
    const sessionsChange = lastMonthSessions.size > 0
      ? ((currentMonthSessions.size - lastMonthSessions.size) / lastMonthSessions.size) * 100
      : 0;

    // 3. Fetch active therapists (users with role 'therapist')
    const usersRef = collection(db, 'users');
    const activeTherapists = await getDocs(
      query(usersRef, where('role', '==', 'therapist'))
    );
    
    // 4. Fetch top services
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    const topServices = productsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unknown',
        price: doc.data().price || 0,
        count: 0 // Will be updated below
      }))
      .slice(0, 5); // Take top 5

    // 5. Fetch recent activities (last 10 activities)
    const recentPayments = await getDocs(
      query(
        collection(db, 'transactions'),
        orderBy('date', 'desc'),
        limit(5)
      )
    );

    const recentActivities = recentPayments.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: 'payment' as const,
        title: 'Pembayaran Baru',
        description: `Pembayaran sebesar Rp${data.total?.toLocaleString()}`,
        date: data.date?.toDate() || new Date(),
        amount: data.total,
        link: `/keuangan/transaksi/${doc.id}`
      };
    });

    // 6. Fetch monthly data for the last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = getMonthStart(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);
      
      const monthlyTransactions = await getDocs(
        query(
          transactionsRef,
          where('date', '>=', Timestamp.fromDate(monthStart)),
          where('date', '<=', Timestamp.fromDate(monthEnd))
        )
      );
      
      const monthlyExpenses = await getDocs(
        query(
          collection(db, 'expenses'),
          where('date', '>=', monthStart),
          where('date', '<=', monthEnd)
        )
      );
      
      const revenue = monthlyTransactions.docs.reduce(
        (sum, doc) => sum + (doc.data().total || 0), 0
      );
      
      const expenses = monthlyExpenses.docs.reduce(
        (sum, doc) => sum + (doc.data().amount || 0), 0
      );
      
      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
        revenue,
        expenses
      });
    }

    return {
      totalRevenue: currentMonthRevenue,
      revenueChange,
      totalSessions: currentMonthSessions.size,
      sessionsChange,
      activeTherapists: activeTherapists.size,
      therapistsChange: 0, // Not implemented
      topServices: topServices.map(s => ({
        ...s,
        count: Math.floor(Math.random() * 100), // Placeholder
        revenue: Math.floor(Math.random() * 10000000) // Placeholder
      })),
      recentActivities,
      monthlyData
    };
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};
