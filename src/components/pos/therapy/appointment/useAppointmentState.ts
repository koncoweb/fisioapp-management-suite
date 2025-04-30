
import { useState, useEffect, useCallback } from 'react';
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
  
  // Fix: Use useCallback to memoize the date change handler to avoid dependency issues
  const handleDateChange = useCallback((date: Date | undefined, index: number) => {
    setTempDates(prev => {
      const newDates = [...prev];
      newDates[index] = date;
      return newDates;
    });
    
    // Check therapist availability when date changes
    if (date && therapistId) {
      checkAvailability(date);
    }
    
    // Clear time when date changes
    setTempTimes(prev => {
      const newTimes = [...prev];
      newTimes[index] = undefined;
      return newTimes;
    });
  }, [therapistId, checkAvailability]);

  const handleTimeChange = useCallback((time: string, index: number) => {
    setTempTimes(prev => {
      const newTimes = [...prev];
      newTimes[index] = time;
      return newTimes;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
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
    setActiveTab(currentSlotIndex.toString());
    
    // If we have both a therapist and a date for the current slot, check availability
    if (therapistId && initialDates[currentSlotIndex]) {
      checkAvailability(initialDates[currentSlotIndex]);
    }
  }, [isOpen, appointments, maxAppointments, currentSlotIndex, therapistId]); // Remove checkAvailability from dependencies

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
