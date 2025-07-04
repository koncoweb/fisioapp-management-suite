import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/dashboardService';

export const TopServices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Layanan Terpopuler</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center py-2">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16 ml-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Layanan Terpopuler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Gagal memuat data layanan.
          </div>
        </CardContent>
      </Card>
    );
  }

  const topServices = data?.topServices || [];

  if (topServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Layanan Terpopuler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Tidak ada data layanan.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Layanan Terpopuler</CardTitle>
          <Link 
            to="/admin/layanan" 
            className="text-xs text-primary hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topServices.map((service, index) => (
            <div key={service.id} className="flex items-center">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                {index + 1}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{service.name}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{service.count} sesi</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    {Math.floor((service.count / (topServices[0]?.count || 1)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="text-sm font-medium">
                {new Intl.NumberFormat('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR',
                  maximumFractionDigits: 0 
                }).format(service.revenue)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
