
import React from 'react';
import StatsCard from './StatsCard';
import { Users, Calendar, Heart, Activity } from 'lucide-react';

const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Upcoming Appointments"
        value={3}
        description="Next: Tomorrow at 10:00 AM"
        icon={Calendar}
      />
      <StatsCard
        title="Active Therapists"
        value={2}
        description="Assigned to your care"
        icon={Users}
      />
      <StatsCard
        title="Treatment Progress"
        value="75%"
        description="Overall completion"
        icon={Activity}
      />
      <StatsCard
        title="Wellness Score"
        value={8.5}
        description="out of 10"
        icon={Heart}
      />
    </div>
  );
};

export default StatsGrid;
