
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from 'lucide-react';
import { disabledDates, generateTimeSlots } from './timeUtils';
import { AppointmentSlot } from '@/types/pos';

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAppointments: AppointmentSlot[]) => void;
  onOpenChange?: (open: boolean) => void;
  selectedOption?: 'visit' | 'package';
  currentSlotIndex?: number;
  appointments?: AppointmentSlot[];
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenChange,
  selectedOption = 'visit',
  currentSlotIndex = 0,
  appointments = []
}) => {
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
  const [tempTime, setTempTime] = useState<string | undefined>(undefined);
  
  const timeSlots = generateTimeSlots();

  const handleAddAppointment = () => {
    if (!tempDate || !tempTime) return;
    
    const newAppointment: AppointmentSlot = { date: tempDate, time: tempTime };
    const updatedAppointments = [...appointments];
    
    if (currentSlotIndex < updatedAppointments.length) {
      updatedAppointments[currentSlotIndex] = newAppointment;
    } else {
      updatedAppointments.push(newAppointment);
    }
    
    onConfirm(updatedAppointments);
    setTempDate(undefined);
    setTempTime(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (onOpenChange) onOpenChange(open);
      if (!open) onClose();
    }}>
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
            onClick={handleAddAppointment}
          >
            {currentSlotIndex < appointments.length ? 'Update Appointment' : 'Add Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
