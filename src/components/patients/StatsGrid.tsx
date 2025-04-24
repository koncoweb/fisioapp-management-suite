
import React from 'react';
import StatsCard from './StatsCard';
import { Users, Calendar, Heart, Activity } from 'lucide-react';

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Jadwal Pemeriksaan"
        value={3}
        description="Berikutnya: Besok jam 10:00"
        icon={Calendar}
      />
      <StatsCard
        title="Terapis Aktif"
        value={2}
        description="Ditugaskan untuk perawatan Anda"
        icon={Users}
      />
      <StatsCard
        title="Progres Pengobatan"
        value="75%"
        description="Penyelesaian keseluruhan"
        icon={Activity}
      />
      <StatsCard
        title="Skor Kesehatan"
        value={8.5}
        description="dari 10"
        icon={Heart}
      />
    </div>
  );
};

export default StatsGrid;
