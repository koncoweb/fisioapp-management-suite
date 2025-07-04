
import { useState } from "react";
import { format } from "date-fns";
import { useTransactions, useExpenses } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { Transaction, Expense, FinancialRecord } from "@/types/keuangan";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TransactionsTable = () => {
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Ekstrak semua kategori transaksi yang ada
  const transactionCategories = [...new Set(transactions
    .filter(t => t.category)
    .map(t => t.category as string))].sort();

  // Combine and sort transactions and expenses
  const allRecords: FinancialRecord[] = [...transactions, ...expenses].sort(
    (a, b) => {
      const dateA = a.type === 'income' ? a.transactionDate.getTime() : a.date.getTime();
      const dateB = b.type === 'income' ? b.transactionDate.getTime() : b.date.getTime();
      return dateB - dateA;
    }
  );

  const filterRecords = (records: FinancialRecord[]) => {
    let filteredRecords = records;
    
    // Filter berdasarkan kategori jika bukan 'all'
    if (categoryFilter !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        if (record.type === 'income') {
          const transaction = record as Transaction;
          return transaction.category === categoryFilter;
        } else {
          const expense = record as Expense;
          return expense.category === categoryFilter;
        }
      });
    }
    
    // Filter berdasarkan search term jika ada
    if (searchTerm) {
      filteredRecords = filteredRecords.filter(record => {
        if (record.type === 'income') {
          const transaction = record as Transaction;
          return (
            (transaction.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            transaction.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.items.some(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            (transaction.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (transaction.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
          );
        } else {
          const expense = record as Expense;
          return (
            expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      });
    }
    
    return filteredRecords;
  };

  const filteredAll = filterRecords(allRecords);
  const filteredTransactions = filterRecords(transactions);
  const filteredExpenses = filterRecords(expenses);

  const renderTransactionRow = (transaction: Transaction) => (
    <TableRow key={transaction.id}>
      <TableCell>
        {format(transaction.transactionDate, 'PPP')}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-green-50">Pendapatan</Badge>
      </TableCell>
      <TableCell>{transaction.receiptNo}</TableCell>
      <TableCell>
        {transaction.patientName || 'Tanpa Pasien'}
        {transaction.category && (
          <Badge variant="outline" className="ml-2 bg-blue-50">
            {transaction.category}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="text-green-600">{formatCurrency(transaction.total)}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {transaction.note || transaction.items.map(item => item.name).join(", ")}
      </TableCell>
    </TableRow>
  );

  const renderExpenseRow = (expense: Expense) => (
    <TableRow key={expense.id}>
      <TableCell>
        {format(expense.date, 'PPP')}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-red-50">Pengeluaran</Badge>
      </TableCell>
      <TableCell>{expense.category}</TableCell>
      <TableCell>{expense.name}</TableCell>
      <TableCell>
        <span className="text-red-600">{formatCurrency(expense.amount)}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell">{expense.description}</TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h3 className="text-lg font-medium">Catatan Keuangan</h3>
        <div className="w-full flex flex-col md:flex-row gap-2">
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border rounded-md text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {transactionCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value="Tanpa Kategori">Tanpa Kategori</option>
            </select>
          </div>
          <div className="w-full md:w-64">
            <Input
              placeholder="Cari catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua Catatan</TabsTrigger>
          <TabsTrigger value="income">Pendapatan</TabsTrigger>
          <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {(transactionsLoading || expensesLoading) ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAll.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">Tidak ada catatan ditemukan</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>ID/Kategori</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="hidden md:table-cell">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAll.map((record) =>
                    record.type === 'income'
                      ? renderTransactionRow(record as Transaction)
                      : renderExpenseRow(record as Expense)
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="income">
          {transactionsLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">Tidak ada catatan pendapatan ditemukan</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>No. Kwitansi</TableHead>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="hidden md:table-cell">Item</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(renderTransactionRow)}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="expenses">
          {expensesLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">Tidak ada catatan pengeluaran ditemukan</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="hidden md:table-cell">Deskripsi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map(renderExpenseRow)}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
