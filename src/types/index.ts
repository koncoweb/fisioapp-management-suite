
export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'therapist' | 'karyawan';
  phone?: string;
  specialization?: string;
  profileImageUrl?: string;
  createdAt: string;
}

export interface TherapyService {
  id: string;
  name: string;
  description: string;
  equipment: string;
  duration: number; // in minutes
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BookingSession {
  id: string;
  therapistId: string;
  therapistName: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  therapistId: string;
  therapistName: string;
  paymentDate: string;
  serviceId: string;
  serviceName: string;
  therapistShare: number; // amount paid to therapist
  clinicShare: number; // amount kept by clinic
  paymentMethod: 'cash' | 'card' | 'transfer';
  createdAt: string;
  createdBy: string;
}

export interface Patient {
  id: string;
  nama: string;
  alamat: string;
  usia: number;
  keluhan?: string;
  telepon?: string;
  email?: string;
  riwayatMedis?: string;
  createdAt: any;
}
