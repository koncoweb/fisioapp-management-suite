
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
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
  pendingConfirmations: number;
  todayIncome?: number;
  todayExpenses?: number;
  isAdmin: boolean;
}

export const DashboardStats = ({ pendingConfirmations, todayIncome, todayExpenses, isAdmin }: DashboardStatsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Terapi Perlu Dikonfirmasi"
        value={pendingConfirmations}
        description={pendingConfirmations === 0 ? "Tidak ada terapi yang perlu dikonfirmasi" : "Menunggu konfirmasi"}
        icon={AlertCircle}
        onClick={() => navigate('/admin/therapy-sessions?status=pending')}
        className="bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border-amber-200 dark:border-amber-800"
      />
      
      {isAdmin && (
        <>
          <StatsCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(todayIncome || 0)}
            description="Total pendapatan hari ini"
            icon={TrendingUp}
            onClick={() => navigate('/keuangan')}
            className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
          />
          <StatsCard
            title="Pengeluaran Hari Ini"
            value={formatCurrency(todayExpenses || 0)}
            description="Total pengeluaran hari ini"
            icon={TrendingDown}
            onClick={() => navigate('/keuangan')}
            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
          />
        </>
      )}
    </div>
  );
};
