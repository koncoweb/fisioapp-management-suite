export interface TherapyBooking {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  serviceId: string;
  serviceName: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TherapySession {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface TherapyService {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  type: 'service';
}

export interface WorkingHours {
  start: string; // Format: HH:MM
  end: string; // Format: HH:MM
  days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: '08:00',
  end: '17:00',
  days: [1, 2, 3, 4, 5] // Monday to Friday
};
