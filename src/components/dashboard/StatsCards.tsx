
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}

const StatsCard = ({ title, value, description, icon: Icon }: StatsCardProps) => (
  <Card>
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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Jadwal Hari Ini"
        value={todayBookings}
        description={todayBookings === 0 ? "Tidak ada sesi terjadwal" : "Sesi terjadwal hari ini"}
        icon={Calendar}
      />
      
      {isAdmin && (
        <>
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(todayIncome || 0)}
            description="Total pendapatan hari ini"
            icon={TrendingUp}
          />
          <StatsCard
            title="Pengeluaran Hari Ini"
            value={formatCurrency(todayExpenses || 0)}
            description="Total pengeluaran hari ini"
            icon={TrendingDown}
          />
        </>
      )}
    </div>
  );
};
