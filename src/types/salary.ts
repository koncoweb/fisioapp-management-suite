export interface SalaryComponent {
  amount: number;
  description: string;
  date: string;
}

export interface TherapyPaymentSalary {
  paymentId: string;
  therapySessionId: string;
  patientName: string;
  serviceName: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface TherapistSalaryBonus extends SalaryComponent {}

export interface TherapistSalaryAllowance extends SalaryComponent {}

export interface TherapistSalaryDeduction extends SalaryComponent {}

export interface TherapistSalaryTax extends SalaryComponent {}

export interface TherapistSalaryCashAdvance extends SalaryComponent {}

export interface TherapistSalary {
  id: string;
  therapistId: string;
  therapistName: string;
  periodMonth: number; // 1-12 untuk bulan
  periodYear: number; // tahun, misal 2025
  therapyPayments: TherapyPaymentSalary[];
  bonuses?: TherapistSalaryBonus[];
  allowances?: TherapistSalaryAllowance[];
  deductions?: TherapistSalaryDeduction[];
  taxes?: TherapistSalaryTax[];
  cashAdvances?: TherapistSalaryCashAdvance[];
  totalAmount: number; // Total gaji setelah semua perhitungan
  status: 'pending' | 'paid' | 'cancelled';
  paidDate?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: {
    userId: string;
    name: string;
  };
  notes?: string;
}
