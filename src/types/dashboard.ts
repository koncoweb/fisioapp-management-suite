export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalSessions: number;
  sessionsChange: number;
  activeTherapists: number;
  therapistsChange: number;
  topServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'payment' | 'session' | 'expense' | 'salary';
    title: string;
    description: string;
    date: Date;
    amount?: number;
    link: string;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
}
