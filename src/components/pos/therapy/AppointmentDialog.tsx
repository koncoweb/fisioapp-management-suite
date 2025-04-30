
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { disabledDates, generateTimeSlots } from './timeUtils';
import { AppointmentSlot } from '@/types/pos';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [activeTab, setActiveTab] = useState<string>("0");
  const [tempDates, setTempDates] = useState<Date[]>([]);
  const [tempTimes, setTempTimes] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(generateTimeSlots());
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
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
      
      // Reset available time slots when dialog opens
      setAvailableTimeSlots(generateTimeSlots());
      
      // If we have both a therapist and a date for the current slot, check availability
      if (therapistId && tempDates[currentTabIndex]) {
        checkTherapistAvailability(therapistId, tempDates[currentTabIndex]);
      }
    }
  }, [isOpen, appointments, maxAppointments, currentSlotIndex]);

  const currentTabIndex = parseInt(activeTab);

  // Check therapist availability for a given date
  const checkTherapistAvailability = async (therapistId: string, date: Date) => {
    if (!therapistId || !date) return;
    
    try {
      setIsCheckingAvailability(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Query Firestore for existing appointments on that date for that therapist
      const sessionRef = collection(db, "therapySessions");
      const q = query(
        sessionRef, 
        where("therapistId", "==", therapistId),
        where("date", "==", formattedDate),
        where("status", "!=", "cancelled")
      );
      
      const querySnapshot = await getDocs(q);
      
      // Get all time slots
      const allTimeSlots = generateTimeSlots();
      
      // Filter out booked time slots
      const bookedTimeSlots = new Set<string>();
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        bookedTimeSlots.add(sessionData.time);
      });
      
      // Set available time slots
      const available = allTimeSlots.filter(slot => !bookedTimeSlots.has(slot));
      setAvailableTimeSlots(available);
    } catch (error) {
      console.error("Error checking therapist availability:", error);
      setAvailableTimeSlots(generateTimeSlots()); // Reset to all slots on error
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleDateChange = (date: Date | undefined, index: number) => {
    const newDates = [...tempDates];
    newDates[index] = date;
    setTempDates(newDates);
    
    // Check therapist availability when date changes
    if (date && therapistId) {
      checkTherapistAvailability(therapistId, date);
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

  const canNavigatePrevious = currentTabIndex > 0;
  const canNavigateNext = currentTabIndex < maxAppointments - 1;

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
        
        {selectedOption === 'package' && (
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 p-0" 
              onClick={() => setActiveTab((parseInt(activeTab) - 1).toString())}
              disabled={!canNavigatePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 mx-1">
              <TabsList className="grid grid-cols-4 h-7">
                {Array.from({ length: maxAppointments }).map((_, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={index.toString()} 
                    className="text-[10px] px-0 py-1 h-full data-[state=active]:shadow-none"
                  >
                    Visit {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 p-0" 
              onClick={() => setActiveTab((parseInt(activeTab) + 1).toString())}
              disabled={!canNavigateNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="space-y-3 py-2">
          {/* Calendar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-muted-foreground">Date:</p>
              {tempDates[currentTabIndex] && (
                <p className="text-[10px] font-medium">
                  {format(tempDates[currentTabIndex], "dd MMM yyyy")}
                </p>
              )}
            </div>
            <div className="border rounded-md">
              <CalendarComponent
                mode="single"
                selected={tempDates[currentTabIndex]}
                onSelect={(date) => handleDateChange(date, currentTabIndex)}
                disabled={disabledDates}
                initialFocus
                className="p-2 pointer-events-auto"
              />
            </div>
          </div>
          
          {/* Time Selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-muted-foreground">Time:</p>
              {isCheckingAvailability && (
                <p className="text-[10px] text-muted-foreground">Checking availability...</p>
              )}
            </div>
            <Select 
              value={tempTimes[currentTabIndex]} 
              onValueChange={(value) => handleTimeChange(value, currentTabIndex)}
              disabled={isCheckingAvailability || !tempDates[currentTabIndex]}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <Clock className="h-3 w-3 mr-1.5" />
                <SelectValue placeholder={
                  isCheckingAvailability ? "Checking availability..." :
                  !tempDates[currentTabIndex] ? "Select date first" :
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
                {availableTimeSlots.length === 0 && !isCheckingAvailability && tempDates[currentTabIndex] && (
                  <SelectItem value="" disabled className="text-xs text-muted-foreground">
                    No available slots for this date
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
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
