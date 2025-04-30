
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, getDocs, addDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, Expense } from '@/types/keuangan';

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('transactionDate', 'desc')
      );
      const snapshot = await getDocs(transactionsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          transactionDate: data.transactionDate instanceof Timestamp 
            ? data.transactionDate.toDate() 
            : new Date(data.transactionDate),
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt),
          type: 'income',
        } as Transaction;
      });
    }
  });
};

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const expensesQuery = query(
        collection(db, 'expenses'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(expensesQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp 
            ? data.date.toDate() 
            : new Date(data.date),
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt),
          type: 'expense',
        } as Expense;
      });
    }
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expense,
        createdAt: new Date()
      });
      return { id: docRef.id, ...expense, createdAt: new Date() } as Expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
  });
};
