
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
  className?: string;
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  onClick,
  className 
}: StatsCardProps) => (
  <Card 
    onClick={onClick} 
    className={`${className || ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  todayBookings: number;
  todayIncome?: number;
  todayExpenses?: number;
  isAdmin: boolean;
}

export const DashboardStats = ({ todayBookings, todayIncome, todayExpenses, isAdmin }: DashboardStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Jadwal Hari Ini"
        value={todayBookings}
        description={todayBookings === 0 ? "Tidak ada sesi terjadwal" : "Sesi terjadwal hari ini"}
        icon={Calendar}
        onClick={() => navigate('/admin/bookings')}
        className="bg-blue-50 hover:bg-blue-100 border-blue-200"
      />
      
      {isAdmin && (
        <>
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(todayIncome || 0)}
            description="Total pendapatan hari ini"
            icon={TrendingUp}
            onClick={() => navigate('/keuangan')}
            className="bg-green-50 hover:bg-green-100 border-green-200"
          />
          <StatsCard
            title="Pengeluaran Hari Ini"
            value={formatCurrency(todayExpenses || 0)}
            description="Total pengeluaran hari ini"
            icon={TrendingDown}
            onClick={() => navigate('/keuangan')}
            className="bg-red-50 hover:bg-red-100 border-red-200"
          />
        </>
      )}
    </div>
  );
};
