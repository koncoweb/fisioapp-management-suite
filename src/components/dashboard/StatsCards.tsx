
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';

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
  totalEmployees?: number;
  totalRevenue?: number;
  isAdmin: boolean;
}

export const DashboardStats = ({ todayBookings, totalEmployees, totalRevenue, isAdmin }: DashboardStatsProps) => {
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
            title="Total Karyawan"
            value={totalEmployees || 0}
            description="Anggota staf aktif"
            icon={Users}
          />
          <StatsCard
            title="Total Pendapatan"
            value={`Rp ${(totalRevenue || 0).toLocaleString()}`}
            description="Pendapatan keseluruhan"
            icon={Receipt}
          />
        </>
      )}
    </div>
  );
};
