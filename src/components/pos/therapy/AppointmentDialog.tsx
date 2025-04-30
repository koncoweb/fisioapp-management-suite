
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentSlot } from '@/types/pos';

import CalendarSelector from './appointment/CalendarSelector';
import TimeSelector from './appointment/TimeSelector';
import VisitTabs from './appointment/VisitTabs';
import { useAppointmentAvailability } from './appointment/useAppointmentAvailability';
import { useAppointmentState } from './appointment/useAppointmentState';

interface AppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAppointments: AppointmentSlot[]) => void;
  onOpenChange?: (open: boolean) => void;
  selectedOption?: 'visit' | 'package';
  currentSlotIndex?: number;
  appointments?: AppointmentSlot[];
  maxAppointments?: number;
  therapistId?: string;
}

const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenChange,
  selectedOption = 'visit',
  currentSlotIndex = 0,
  appointments = [],
  maxAppointments = 1,
  therapistId
}) => {
  // Hook for checking therapist availability
  const { 
    availableTimeSlots, 
    isCheckingAvailability, 
    conflictError,
    checkTherapistAvailability 
  } = useAppointmentAvailability(therapistId);
  
  // Hook for managing appointment state
  const {
    activeTab,
    setActiveTab,
    tempDates,
    tempTimes,
    currentTabIndex,
    handleDateChange,
    handleTimeChange
  } = useAppointmentState({
    currentSlotIndex,
    maxAppointments,
    appointments,
    isOpen,
    therapistId,
    checkAvailability: checkTherapistAvailability
  });

  const handleSaveAppointments = () => {
    // Filter out incomplete appointments (missing date or time)
    const validAppointments: AppointmentSlot[] = [];
    
    for (let i = 0; i < maxAppointments; i++) {
      if (tempDates[i] && tempTimes[i]) {
        validAppointments.push({
          date: tempDates[i],
          time: tempTimes[i]
        });
      }
    }
    
    // For package option, require all 4 appointments
    if (selectedOption === 'package' && validAppointments.length < maxAppointments) {
      alert(`Please select all ${maxAppointments} appointment dates and times`);
      return;
    }
    
    onConfirm(validAppointments);
    onClose();
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
              ? `Select Date & Time for Visits (${appointments.filter(a => a.date && a.time).length}/${maxAppointments})` 
              : 'Select Date & Time'
            }
          </DialogTitle>
        </DialogHeader>
        
        {/* Tabs for package mode */}
        {selectedOption === 'package' && (
          <VisitTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            maxAppointments={maxAppointments} 
          />
        )}
        
        <div className="space-y-3 py-2">
          {/* Calendar */}
          <CalendarSelector 
            selectedDate={tempDates[currentTabIndex]} 
            onDateChange={(date) => handleDateChange(date, currentTabIndex)} 
          />
          
          {/* Time Selection */}
          <TimeSelector 
            selectedTime={tempTimes[currentTabIndex]}
            onTimeChange={(time) => handleTimeChange(time, currentTabIndex)}
            availableTimeSlots={availableTimeSlots}
            isCheckingAvailability={isCheckingAvailability}
            isDateSelected={!!tempDates[currentTabIndex]}
            conflictError={conflictError}
          />
        </div>
        
        <DialogFooter className="pt-2">
          <Button 
            className="w-full h-7 text-xs" 
            disabled={
              selectedOption === 'package' 
                ? tempDates.filter(Boolean).length < maxAppointments || tempTimes.filter(Boolean).length < maxAppointments
                : !tempDates[0] || !tempTimes[0]
            }
            onClick={handleSaveAppointments}
          >
            {selectedOption === 'package' ? 'Confirm All Appointments' : 'Confirm Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
