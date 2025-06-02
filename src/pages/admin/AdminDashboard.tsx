import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/dashboardService';
import { RevenueCard, SessionsCard, TherapistsCard, ActivitiesCard } from '@/components/dashboard/AdminStatsCard';
import { RevenueExpenseChart } from '@/components/dashboard/RevenueExpenseChart';
import { TopServices } from '@/components/dashboard/TopServices';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">
          Gagal memuat data dashboard. Silakan coba lagi nanti.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Ringkasan aktivitas dan statistik klinik
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RevenueCard 
          value={data?.totalRevenue || 0} 
          change={data?.revenueChange || 0} 
          isLoading={isLoading} 
        />
        <SessionsCard 
          value={data?.totalSessions || 0} 
          change={data?.sessionsChange || 0} 
          isLoading={isLoading} 
        />
        <TherapistsCard 
          value={data?.activeTherapists || 0} 
          isLoading={isLoading} 
        />
        <ActivitiesCard 
          value={data?.recentActivities?.length || 0} 
          isLoading={isLoading} 
        />
      </div>

      {/* Charts and Top Performers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RevenueExpenseChart />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <TopServices />
          <RecentActivities />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard 
            title="Tambah Pasien Baru" 
            description="Daftarkan pasien baru ke sistem"
            icon="user-plus"
            link="/admin/pasien/baru"
          />
          <QuickActionCard 
            title="Buat Janji" 
            description="Jadwalkan sesi terapi baru"
            icon="calendar-plus"
            link="/admin/terapi/baru"
          />
          <QuickActionCard 
            title="Catat Pembayaran" 
            description="Catat pembayaran pasien"
            icon="credit-card"
            link="/keuangan/transaksi/baru"
          />
          <QuickActionCard 
            title="Laporan Bulanan" 
            description="Lihat laporan keuangan"
            icon="file-text"
            link="/laporan/bulanan"
          />
        </div>
      </div>
    </div>
  );
};

// Helper component for quick action cards
const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  link 
}: { 
  title: string; 
  description: string; 
  icon: string; 
  link: string;
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'user-plus':
        return <UserPlus className="h-5 w-5" />;
      case 'calendar-plus':
        return <CalendarPlus className="h-5 w-5" />;
      case 'credit-card':
        return <CreditCard className="h-5 w-5" />;
      case 'file-text':
        return <FileText className="h-5 w-5" />;
      default:
        return <Plus className="h-5 w-5" />;
    }
  };

  return (
    <a
      href={link}
      className="flex flex-col items-center p-6 bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
        {getIcon()}
      </div>
      <h3 className="font-medium text-center mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </a>
  );
};

// Import icons at the bottom to keep the code organized
import { 
  UserPlus, 
  CalendarPlus, 
  CreditCard, 
  FileText, 
  Plus 
} from 'lucide-react';
