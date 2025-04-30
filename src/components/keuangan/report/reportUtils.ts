
import { Transaction, Expense } from "@/types/keuangan";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportData {
  periodLabel: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  transactions: Transaction[];
  expenses: Expense[];
}

export const generateDailyReport = (date: Date, transactions: Transaction[], expenses: Expense[]): ReportData => {
  const startDate = startOfDay(date);
  const endDate = endOfDay(date);
  return generateReport(
    startDate, 
    endDate, 
    `${format(date, 'PPP', { locale: id })}`,
    transactions,
    expenses
  );
};

export const generateWeeklyReport = (date: Date, transactions: Transaction[], expenses: Expense[]): ReportData => {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const endDate = endOfWeek(date, { weekStartsOn: 1 });
  return generateReport(
    startDate, 
    endDate, 
    `${format(startDate, 'PP', { locale: id })} - ${format(endDate, 'PP', { locale: id })}`,
    transactions,
    expenses
  );
};

export const generateMonthlyReport = (date: Date, transactions: Transaction[], expenses: Expense[]): ReportData => {
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);
  return generateReport(
    startDate, 
    endDate, 
    `${format(date, 'MMMM yyyy', { locale: id })}`,
    transactions,
    expenses
  );
};

export const generateReport = (
  startDate: Date, 
  endDate: Date, 
  periodLabel: string,
  transactions: Transaction[],
  expenses: Expense[]
): ReportData => {
  const filteredTransactions = transactions.filter(
    t => t.transactionDate >= startDate && t.transactionDate <= endDate
  );
  
  const filteredExpenses = expenses.filter(
    e => e.date >= startDate && e.date <= endDate
  );
  
  const totalIncome = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  
  const incomeByCategory = filteredTransactions.reduce((acc, transaction) => {
    transaction.items.forEach(item => {
      const category = item.type;
      if (!acc[category]) acc[category] = 0;
      acc[category] += item.price * item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  return {
    periodLabel,
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    incomeByCategory,
    expensesByCategory,
    transactions: filteredTransactions,
    expenses: filteredExpenses
  };
};

export const downloadReport = (report: ReportData, type: string) => {
  const fileName = `laporan-keuangan-${type}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
