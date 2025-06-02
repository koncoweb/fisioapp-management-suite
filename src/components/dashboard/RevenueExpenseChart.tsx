import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetchDashboardStats } from '@/services/dashboardService';

export const RevenueExpenseChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Grafik Pendapatan & Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Grafik Pendapatan & Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-red-500">
            Gagal memuat data grafik. Silakan coba lagi.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = data?.monthlyData || [];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Grafik Pendapatan & Pengeluaran (6 Bulan Terakhir)
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                }
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [
                  new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    maximumFractionDigits: 0 
                  }).format(value),
                  ''
                ]}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Pendapatan" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name="Pengeluaran" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
