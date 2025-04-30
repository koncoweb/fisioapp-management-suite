
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateTimeSlots } from '../timeUtils';

export const useAppointmentAvailability = (therapistId: string | undefined) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(generateTimeSlots());
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const checkTherapistAvailability = useCallback(async (date: Date | undefined) => {
    if (!therapistId || !date) {
      setAvailableTimeSlots(generateTimeSlots());
      setConflictError(null);
      return;
    }
    
    try {
      setIsCheckingAvailability(true);
      setConflictError(null);
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

      // If no available slots, set conflict error
      if (available.length === 0) {
        setConflictError(`Terapis tidak tersedia pada tanggal ${formattedDate}. Semua jadwal sudah terisi.`);
      }
    } catch (error) {
      console.error("Error checking therapist availability:", error);
      setConflictError("Gagal memeriksa ketersediaan terapis. Silakan coba lagi.");
      setAvailableTimeSlots(generateTimeSlots()); // Reset to all slots on error
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [therapistId]);

  return {
    availableTimeSlots,
    isCheckingAvailability,
    conflictError,
    checkTherapistAvailability
  };
};
