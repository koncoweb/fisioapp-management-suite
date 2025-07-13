
import React, { useState, useEffect } from 'react';
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
              Selamat datang, {userData?.namaLengkap || userData?.email}
            </p>
          </div>

        </div>
      </div>

      <StatsGrid />
      <RecentActivities />
    </div>
  );
};

export default PatientDashboard;
