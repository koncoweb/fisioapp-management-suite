
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TherapySessionFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchDate: string;
  setSearchDate: (value: string) => void;
}

const TherapySessionFilters: React.FC<TherapySessionFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  searchDate,
  setSearchDate
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient or therapist name..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-auto">
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default TherapySessionFilters;
