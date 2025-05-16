export interface TherapySession {
  id: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM
  duration: number; // dalam menit
  isPackage: boolean;
  packageIndex?: number;
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  status: 'pending' | 'completed' | 'cancelled' | 'confirmed';
  therapistId: string;
  therapistName: string;
  notes?: string;
  createdAt: string;
  statusDiupdate?: {
    nama: string;
    userId: string;
    timestamp: string;
  };
  isPaid?: boolean; // Status pembayaran sesi terapi
  paymentType?: 'direct' | 'salary'; // Jenis pembayaran: langsung atau masuk gaji
}

export interface TherapySessionFormData {
  patientId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  isPackage: boolean;
  packageIndex?: number;
  notes?: string;
}
