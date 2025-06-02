import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, DollarSign, Calendar, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/dashboardService';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'payment':
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'session':
      return <Calendar className="h-4 w-4 text-blue-500" />;
    case 'expense':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case 'salary':
      return <DollarSign className="h-4 w-4 text-purple-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export const RecentActivities = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start py-2">
              <Skeleton className="h-4 w-4 rounded-full mt-1 mr-2" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
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
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Gagal memuat aktivitas terbaru.
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = data?.recentActivities || [];

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Tidak ada aktivitas terbaru.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Aktivitas Terbaru</CardTitle>
          <Link 
            to="/admin/aktivitas" 
            className="text-xs text-primary hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <Link 
              key={activity.id} 
              to={activity.link}
              className="flex items-start hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(activity.date), { 
                    addSuffix: true, 
                    locale: id 
                  })}
                </div>
              </div>
              {activity.amount !== undefined && (
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    maximumFractionDigits: 0 
                  }).format(activity.amount)}
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
