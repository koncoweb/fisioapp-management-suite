
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';
import { disabledDates } from './timeUtils';

interface AppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOption: 'visit' | 'package';
  currentSlotIndex: number;
  tempDate: Date | undefined;
  setTempDate: (date: Date | undefined) => void;
  tempTime: string | undefined;
  setTempTime: (time: string) => void;
  onAddAppointment: () => void;
  timeSlots: string[];
  appointments: { date: Date; time: string }[];
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedOption,
  currentSlotIndex,
  tempDate,
  setTempDate,
  tempTime,
  setTempTime,
  onAddAppointment,
  timeSlots,
  appointments
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[350px] p-3">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center text-sm">
            {selectedOption === 'package' 
              ? `Select Date & Time for Visit ${currentSlotIndex + 1}` 
              : 'Select Date & Time'
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          {/* Calendar */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Date:</p>
            <div className="border rounded-md">
              <CalendarComponent
                mode="single"
                selected={tempDate}
                onSelect={setTempDate}
                disabled={disabledDates}
                initialFocus
                className="p-2 pointer-events-auto"
              />
            </div>
          </div>
          
          {/* Time Selection */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">Time:</p>
            <Select value={tempTime} onValueChange={setTempTime}>
              <SelectTrigger className="w-full h-8 text-xs">
                <Clock className="h-3 w-3 mr-1.5" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot} className="text-xs">
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className="pt-2">
          <Button 
            className="w-full h-7 text-xs" 
            disabled={!tempDate || !tempTime}
            onClick={onAddAppointment}
          >
            {currentSlotIndex < appointments.length ? 'Update Appointment' : 'Add Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
