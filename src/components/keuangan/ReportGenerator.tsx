import { useState } from "react";
import { useTransactions, useExpenses } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, Expense } from "@/types/keuangan";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export const ReportGenerator = () => {
  const { data: transactions = [] } = useTransactions();
  const { data: expenses = [] } = useExpenses();
  const [date, setDate] = useState<Date>(new Date());

  const generateDailyReport = () => {
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);
    return generateReport(startDate, endDate, `${format(date, 'PPP')}`);
  };

  const generateWeeklyReport = () => {
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });
    return generateReport(
      startDate, 
      endDate, 
      `${format(startDate, 'PP')} - ${format(endDate, 'PP')}`
    );
  };

  const generateMonthlyReport = () => {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    return generateReport(
      startDate, 
      endDate, 
      `${format(date, 'MMMM yyyy')}`
    );
  };

  const generateReport = (startDate: Date, endDate: Date, periodLabel: string) => {
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

  const downloadReport = (report: any, type: string) => {
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

  const renderReport = (report: any) => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Laporan Keuangan</h3>
            <p className="text-sm text-muted-foreground">{report.periodLabel}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadReport(report, report.periodLabel.replace(/\s+/g, '-').toLowerCase())}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Unduh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(report.totalIncome)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(report.totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", report.balance >= 0 ? "text-green-600" : "text-red-600")}>
                {formatCurrency(report.balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan berdasarkan Kategori</CardTitle>
              <CardDescription>Rincian sumber pendapatan</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(report.incomeByCategory).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(report.incomeByCategory).map(([category, amount]) => (
                    <li key={category} className="flex justify-between items-center">
                      <span className="capitalize">{category}</span>
                      <span className="font-medium text-green-600">{formatCurrency(amount as number)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">Tidak ada data pendapatan untuk periode ini</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran berdasarkan Kategori</CardTitle>
              <CardDescription>Rincian kategori pengeluaran</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(report.expensesByCategory).length > 0 ? (
                <ul className="space-y-2">
                  {Object.entries(report.expensesByCategory).map(([category, amount]) => (
                    <li key={category} className="flex justify-between items-center">
                      <span>{category}</span>
                      <span className="font-medium text-red-600">{formatCurrency(amount as number)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-4">Tidak ada data pengeluaran untuk periode ini</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Transaksi</CardTitle>
            <CardDescription>
              {report.transactions.length} transaksi pendapatan, {report.expenses.length} transaksi pengeluaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 my-4" />
            <p className="text-center text-sm text-muted-foreground">
              Unduh laporan lengkap untuk melihat data transaksi secara detail
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Laporan Keuangan</h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">Harian</TabsTrigger>
          <TabsTrigger value="weekly">Mingguan</TabsTrigger>
          <TabsTrigger value="monthly">Bulanan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          {renderReport(generateDailyReport())}
        </TabsContent>
        
        <TabsContent value="weekly">
          {renderReport(generateWeeklyReport())}
        </TabsContent>
        
        <TabsContent value="monthly">
          {renderReport(generateMonthlyReport())}
        </TabsContent>
      </Tabs>
    </div>
  );
};
