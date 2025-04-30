
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
  status: 'scheduled' | 'completed' | 'cancelled';
  transactionId?: string;
  isPackage?: boolean;
  packageIndex?: number;
  createdAt: Date;
}

export const saveTherapySession = async (
  patient: Patient,
  therapist: Employee,
  serviceId: string,
  serviceName: string,
  appointment: AppointmentSlot,
  isPackage = false,
  packageIndex = 0,
  transactionId?: string
) => {
  try {
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
    
    // Create the therapy session
    const sessionData: TherapySessionData = {
      patientId: patient.id,
      patientName: patient.nama,
      therapistId: therapist.id,
      therapistName: therapist.name,
      serviceId,
      serviceName,
      date: formattedDate,
      time: appointment.time,
      status: 'scheduled',
      transactionId,
      isPackage,
      packageIndex: isPackage ? packageIndex : undefined,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(db, "therapySessions"), sessionData);
    return { id: docRef.id, ...sessionData };
  } catch (error) {
    console.error("Error saving therapy session:", error);
    throw error;
  }
};
