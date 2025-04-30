
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { AppointmentSlot } from '@/types/pos';
import { format } from 'date-fns';
import { Employee, Patient } from '@/types';

export interface TherapySessionData {
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  serviceName: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  transactionId?: string | null; // Changed to accept null as well
  isPackage?: boolean;
  packageIndex?: number;
  createdAt: Date;
  statusDiupdate?: {
    nama: string;
    userId: string;
    timestamp: string;
  };
}

export const saveTherapySession = async (
  patient: Patient,
  therapist: Employee,
  serviceId: string,
  serviceName: string,
  appointment: AppointmentSlot,
  isPackage = false,
  packageIndex = 0,
  transactionId?: string,
  duration?: number
) => {
  try {
    if (!patient || !patient.id) {
      throw new Error("Data pasien tidak valid");
    }
    
    if (!therapist || !therapist.id) {
      throw new Error("Data terapis tidak valid");
    }
    
    if (!appointment || !appointment.date || !appointment.time) {
      throw new Error("Data jadwal tidak lengkap");
    }
    
    const formattedDate = format(appointment.date, 'yyyy-MM-dd');
    
    // Check for conflicting appointments
    const conflictingSessionsRef = collection(db, "therapySessions");
    const q = query(
      conflictingSessionsRef, 
      where("therapistId", "==", therapist.id),
      where("date", "==", formattedDate),
      where("time", "==", appointment.time),
      where("status", "!=", "cancelled")
    );
    
    const conflictingSnapshot = await getDocs(q);
    if (!conflictingSnapshot.empty) {
      throw new Error(`Terapis ${therapist.name} sudah memiliki jadwal pada ${formattedDate} pukul ${appointment.time}`);
    }
    
    // Create the therapy session data object
    const sessionData: TherapySessionData = {
      patientId: patient.id,
      patientName: patient.nama,
      therapistId: therapist.id,
      therapistName: therapist.name,
      serviceId,
      serviceName,
      date: formattedDate,
      time: appointment.time,
      duration: duration || 60,
      status: 'scheduled',
      isPackage,
      packageIndex: isPackage ? packageIndex : undefined,
      createdAt: new Date()
    };
    
    // Only add transactionId if it exists and is not undefined
    if (transactionId) {
      sessionData.transactionId = transactionId;
    }
    
    const docRef = await addDoc(collection(db, "therapySessions"), sessionData);
    return { id: docRef.id, ...sessionData };
  } catch (error) {
    console.error("Error saving therapy session:", error);
    throw error;
  }
};
