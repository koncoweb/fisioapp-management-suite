
import React from 'react';
import StatsGrid from '@/components/patients/StatsGrid';
import RecentActivities from '@/components/patients/RecentActivities';

const PatientDashboard = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-2">Patient Dashboard</h1>
        <p className="text-blue-600/80">Welcome to your medical care center</p>
      </div>

      <StatsGrid />
      <RecentActivities />
    </div>
  );
};

export default PatientDashboard;
