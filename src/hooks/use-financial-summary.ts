
import { useQuery } from '@tanstack/react-query';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, format } from 'date-fns';
import { useTransactions } from './use-transactions';
import { useExpenses } from './use-transactions';
import { FinancialSummary } from '@/types/keuangan';

export const useFinancialSummary = (period: 'day' | 'week' | 'month' = 'day') => {
  const { data: transactions = [] } = useTransactions();
  const { data: expenses = [] } = useExpenses();
  
  return useQuery({
    queryKey: ['financialSummary', period, transactions.length, expenses.length],
    queryFn: () => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let periodLabel: string;
      
      if (period === 'day') {
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        periodLabel = format(now, 'PPP');
      } else if (period === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodLabel = `${format(startDate, 'PP')} - ${format(endDate, 'PP')}`;
      } else { // month
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodLabel = format(now, 'MMMM yyyy');
      }
      
      const filteredTransactions = transactions.filter(
        t => t.transactionDate >= startDate && t.transactionDate <= endDate
      );
      
      const filteredExpenses = expenses.filter(
        e => e.date >= startDate && e.date <= endDate
      );
      
      const totalIncome = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      return {
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        period: periodLabel
      } as FinancialSummary;
    },
    enabled: transactions.length > 0 || expenses.length > 0,
  });
};
