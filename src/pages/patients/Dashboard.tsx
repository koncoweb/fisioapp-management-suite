
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import StatsGrid from '@/components/patients/StatsGrid';
import RecentActivities from '@/components/patients/RecentActivities';

const PatientDashboard = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">Dashboard Pasien</h1>
            <p className="text-blue-600/80">Selamat datang di pusat perawatan medis Anda</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/booking">
                <CalendarPlus className="mr-2 h-4 w-4" />
                Buat Jadwal Terapi
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <StatsGrid />
      <RecentActivities />
    </div>
  );
};

export default PatientDashboard;
