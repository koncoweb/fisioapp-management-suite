
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

  // Combine and sort transactions and expenses
  const allRecords: FinancialRecord[] = [...transactions, ...expenses].sort(
    (a, b) => {
      const dateA = a.type === 'income' ? a.transactionDate.getTime() : a.date.getTime();
      const dateB = b.type === 'income' ? b.transactionDate.getTime() : b.date.getTime();
      return dateB - dateA;
    }
  );

  const filterRecords = (records: FinancialRecord[]) => {
    if (!searchTerm) return records;
    
    return records.filter(record => {
      if (record.type === 'income') {
        const transaction = record as Transaction;
        return (
          transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.items.some(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
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
      <TableCell>{transaction.patientName}</TableCell>
      <TableCell>
        <span className="text-green-600">{formatCurrency(transaction.total)}</span>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {transaction.items.map(item => item.name).join(", ")}
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Catatan Keuangan</h3>
        <div className="w-full max-w-sm">
          <Input
            placeholder="Cari catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
