import { ArrowUp, ArrowDown, Users, Calendar, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  link: string;
  isLoading?: boolean;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  change = 0,
  icon: Icon,
  link,
  isLoading = false,
  className,
}: StatsCardProps) => {
  const isPositive = change >= 0;
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={link} className="block">
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {typeof change === 'number' && (
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ChangeIcon
                className={cn(
                  'h-3 w-3 mr-1',
                  isPositive ? 'text-green-500' : 'text-red-500'
                )}
              />
              <span className={cn(isPositive ? 'text-green-500' : 'text-red-500')}>
                {Math.abs(change).toFixed(1)}% {isPositive ? 'naik' : 'turun'} dari bulan lalu
              </span>
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

// Predefined stat cards for common metrics
export const RevenueCard = ({ value, change, isLoading }: { value: number; change: number; isLoading?: boolean }) => (
  <StatsCard
    title="Pendapatan Bulan Ini"
    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)}
    change={change}
    icon={DollarSign}
    link="/keuangan/laporan"
    isLoading={isLoading}
    className="border-l-4 border-l-blue-500"
  />
);

export const SessionsCard = ({ value, change, isLoading }: { value: number; change: number; isLoading?: boolean }) => (
  <StatsCard
    title="Sesi Terapi Bulan Ini"
    value={value}
    change={change}
    icon={Calendar}
    link="/admin/terapi"
    isLoading={isLoading}
    className="border-l-4 border-l-green-500"
  />
);

export const TherapistsCard = ({ value, isLoading }: { value: number; isLoading?: boolean }) => (
  <StatsCard
    title="Terapis Aktif"
    value={value}
    icon={Users}
    link="/admin/terapis"
    isLoading={isLoading}
    className="border-l-4 border-l-purple-500"
  />
);

export const ActivitiesCard = ({ value, isLoading }: { value: number; isLoading?: boolean }) => (
  <StatsCard
    title="Aktivitas Hari Ini"
    value={value}
    icon={Activity}
    link="/admin/aktivitas"
    isLoading={isLoading}
    className="border-l-4 border-l-amber-500"
  />
);
