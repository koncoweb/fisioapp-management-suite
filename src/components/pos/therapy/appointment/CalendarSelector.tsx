
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { disabledDates } from '../timeUtils';

interface CalendarSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] text-muted-foreground">Date:</p>
        {selectedDate && (
          <p className="text-[10px] font-medium">
            {format(selectedDate, "dd MMM yyyy")}
          </p>
        )}
      </div>
      <div className="border rounded-md">
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          disabled={disabledDates}
          initialFocus
          className="p-2 pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default CalendarSelector;
