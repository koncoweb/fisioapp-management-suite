
import { DEFAULT_WORKING_HOURS } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';

// Define the toast function type correctly
type ToastFunction = typeof useToast extends () => infer R 
  ? R extends { toast: infer T } ? T : never 
  : never;

export const generateTimeSlots = (date: Date | undefined, toast: ToastFunction) => {
  if (!date) return [];
  
  const dayOfWeek = date.getDay();
  if (!DEFAULT_WORKING_HOURS.days.includes(dayOfWeek)) {
    toast({
      title: "Hari Libur",
      description: "Klinik tutup pada hari ini. Silakan pilih hari kerja (Senin-Jumat).",
      variant: "destructive",
    });
    return [];
  }
  
  const [startHour, startMinute] = DEFAULT_WORKING_HOURS.start.split(':').map(Number);
  const [endHour, endMinute] = DEFAULT_WORKING_HOURS.end.split(':').map(Number);
  
  const slots: string[] = [];
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  
  return slots;
};

export const isDateDisabled = (date: Date) => {
  const day = date.getDay();
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
  const isWorkingDay = DEFAULT_WORKING_HOURS.days.includes(day);
  return isPastDate || !isWorkingDay;
};
