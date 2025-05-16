export interface TherapyPayment {
  id: string;
  therapySessionId: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  paymentType: 'direct' | 'salary'; // 'direct' untuk pembayaran langsung, 'salary' untuk masuk gaji
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: {
    userId: string;
    name: string;
  };
  notes?: string;
  receiptNumber?: string;
  emailSent?: boolean;
}
