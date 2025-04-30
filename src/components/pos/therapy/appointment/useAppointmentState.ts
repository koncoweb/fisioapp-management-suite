
import { useState, useEffect } from 'react';
import { AppointmentSlot } from '@/types/pos';

interface UseAppointmentStateProps {
  currentSlotIndex: number;
  maxAppointments: number;
  appointments: AppointmentSlot[];
  isOpen: boolean;
  therapistId?: string;
  checkAvailability: (date: Date | undefined) => void;
}

export const useAppointmentState = ({
  currentSlotIndex,
  maxAppointments,
  appointments,
  isOpen,
  therapistId,
  checkAvailability
}: UseAppointmentStateProps) => {
  const [activeTab, setActiveTab] = useState<string>("0");
  const [tempDates, setTempDates] = useState<Date[]>([]);
  const [tempTimes, setTempTimes] = useState<string[]>([]);
  
  useEffect(() => {
    // Initialize arrays with existing appointment data or empty slots
    const initialDates: Date[] = [];
    const initialTimes: string[] = [];
    
    for (let i = 0; i < maxAppointments; i++) {
      initialDates[i] = appointments[i]?.date || undefined;
      initialTimes[i] = appointments[i]?.time || undefined;
    }
    
    setTempDates(initialDates);
    setTempTimes(initialTimes);
    
    // Set active tab to current slot index when dialog opens
    if (isOpen) {
      setActiveTab(currentSlotIndex.toString());
      
      // If we have both a therapist and a date for the current slot, check availability
      const currentTabIdx = parseInt(currentSlotIndex.toString());
      if (therapistId && initialDates[currentTabIdx]) {
        checkAvailability(initialDates[currentTabIdx]);
      }
    }
  }, [isOpen, appointments, maxAppointments, currentSlotIndex, therapistId, checkAvailability]);

  const handleDateChange = (date: Date | undefined, index: number) => {
    const newDates = [...tempDates];
    newDates[index] = date;
    setTempDates(newDates);
    
    // Check therapist availability when date changes
    if (date && therapistId) {
      checkAvailability(date);
    }
    
    // Clear time when date changes
    const newTimes = [...tempTimes];
    newTimes[index] = undefined;
    setTempTimes(newTimes);
  };

  const handleTimeChange = (time: string, index: number) => {
    const newTimes = [...tempTimes];
    newTimes[index] = time;
    setTempTimes(newTimes);
  };

  const currentTabIndex = parseInt(activeTab);

  return {
    activeTab,
    setActiveTab,
    tempDates,
    tempTimes,
    currentTabIndex,
    handleDateChange,
    handleTimeChange
  };
};
