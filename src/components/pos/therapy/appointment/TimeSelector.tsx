
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TimeSelectorProps {
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
  availableTimeSlots: string[];
  isCheckingAvailability: boolean;
  isDateSelected: boolean;
  conflictError?: string | null;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange,
  availableTimeSlots,
  isCheckingAvailability,
  isDateSelected,
  conflictError
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

      {conflictError && isDateSelected && !isCheckingAvailability && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs ml-2">
            {conflictError}
          </AlertDescription>
        </Alert>
      )}

      {availableTimeSlots.length === 0 && isDateSelected && !isCheckingAvailability && !conflictError && (
        <p className="text-[10px] text-destructive mt-1">
          Tidak ada jadwal tersedia untuk terapis pada tanggal ini.
        </p>
      )}
    </div>
  );
};

export default TimeSelector;
