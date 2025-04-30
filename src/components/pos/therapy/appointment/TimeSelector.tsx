
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
  availableTimeSlots: string[];
  isCheckingAvailability: boolean;
  isDateSelected: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange,
  availableTimeSlots,
  isCheckingAvailability,
  isDateSelected
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] text-muted-foreground">Time:</p>
        {isCheckingAvailability && (
          <p className="text-[10px] text-muted-foreground">Checking availability...</p>
        )}
      </div>
      <Select 
        value={selectedTime} 
        onValueChange={onTimeChange}
        disabled={isCheckingAvailability || !isDateSelected}
      >
        <SelectTrigger className="w-full h-8 text-xs">
          <Clock className="h-3 w-3 mr-1.5" />
          <SelectValue placeholder={
            isCheckingAvailability ? "Checking availability..." :
            !isDateSelected ? "Select date first" :
            availableTimeSlots.length === 0 ? "No available slots" :
            "Select time"
          } />
        </SelectTrigger>
        <SelectContent>
          {availableTimeSlots.map((slot) => (
            <SelectItem key={slot} value={slot} className="text-xs">
              {slot}
            </SelectItem>
          ))}
          {availableTimeSlots.length === 0 && !isCheckingAvailability && isDateSelected && (
            <SelectItem value="" disabled className="text-xs text-muted-foreground">
              No available slots for this date
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeSelector;
