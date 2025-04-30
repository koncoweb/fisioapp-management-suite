
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import StatsGrid from '@/components/patients/StatsGrid';
import RecentActivities from '@/components/patients/RecentActivities';
import { useAuth } from '@/contexts/AuthContext';

const PatientDashboard = () => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple check to ensure auth data is loaded
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex animate-pulse h-10 w-64 bg-blue-100/20 dark:bg-gray-800 rounded"></div>
        <div className="h-32 animate-pulse bg-blue-100/10 dark:bg-gray-800/50 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-300 mb-2">
              Dashboard Pasien
            </h1>
            <p className="text-blue-600/80 dark:text-blue-400/80">
              Selamat datang, {userData?.displayName || userData?.email}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
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
