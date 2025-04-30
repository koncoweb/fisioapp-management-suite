
export interface Transaction {
  id: string;
  receiptNo: string;
  transactionDate: Date;
  patientId: string | null;
  patientName: string;
  items: TransactionItem[];
  total: number;
  originalTotal: number;
  discount: number;
  tax: number;
  taxAmount: number;
  paymentAmount: number;
  changeAmount: number;
  loyaltyPoints: number;
  createdAt: Date;
  type: 'income';
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  therapistId: string | null;
  therapistName: string | null;
  appointments?: {
    date: string;
    time: string;
  }[] | null;
  duration?: number | null;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  description: string;
  date: Date;
  category: string;
  createdAt: Date;
  createdBy: string;
  type: 'expense';
}

export type FinancialRecord = Transaction | Expense;

export interface FinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  period: string;
}
