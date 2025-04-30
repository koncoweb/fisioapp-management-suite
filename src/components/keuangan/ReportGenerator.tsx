import { useState } from "react";
import { useTransactions, useExpenses } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { CalendarIcon, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, Expense } from "@/types/keuangan";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    return generateReport(startDate, endDate, `${format(date, 'PPP', { locale: id })}`);
  };

  const generateWeeklyReport = () => {
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });
    return generateReport(
      startDate, 
      endDate, 
      `${format(startDate, 'PP', { locale: id })} - ${format(endDate, 'PP', { locale: id })}`
    );
  };

  const generateMonthlyReport = () => {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    return generateReport(
      startDate, 
      endDate, 
      `${format(date, 'MMMM yyyy', { locale: id })}`
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

  const generatePDF = (report: any) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: id });
    
    // Add title and date
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("Laporan Keuangan", 105, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(report.periodLabel, 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dibuat pada: ${dateStr}`, 105, 28, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    
    // Summary section
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Ringkasan", 14, 40);

    // Summary cards
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(14, 45, 55, 25, 2, 2, "F");
    doc.roundedRect(75, 45, 55, 25, 2, 2, "F");
    doc.roundedRect(136, 45, 55, 25, 2, 2, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Total Pendapatan", 42, 52, { align: "center" });
    doc.text("Total Pengeluaran", 103, 52, { align: "center" });
    doc.text("Saldo", 164, 52, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(46, 125, 50);
    doc.text(formatCurrency(report.totalIncome), 42, 62, { align: "center" });
    
    doc.setTextColor(211, 47, 47);
    doc.text(formatCurrency(report.totalExpenses), 103, 62, { align: "center" });
    
    doc.setTextColor(report.balance >= 0 ? 46 : 211, report.balance >= 0 ? 125 : 47, report.balance >= 0 ? 50 : 47);
    doc.text(formatCurrency(report.balance), 164, 62, { align: "center" });
    
    // Income by category
    let yPosition = 80;
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Pendapatan berdasarkan Kategori", 14, yPosition);
    
    yPosition += 5;
    
    const incomeData = Object.entries(report.incomeByCategory).map(([category, amount]) => [
      category, formatCurrency(amount as number)
    ]);
    
    if (incomeData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Kategori', 'Jumlah']],
        body: incomeData,
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Tidak ada data pendapatan untuk periode ini", 14, yPosition + 10);
      yPosition += 20;
    }
    
    // Expense by category
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Pengeluaran berdasarkan Kategori", 14, yPosition);
    
    yPosition += 5;
    
    const expenseData = Object.entries(report.expensesByCategory).map(([category, amount]) => [
      category, formatCurrency(amount as number)
    ]);
    
    if (expenseData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Kategori', 'Jumlah']],
        body: expenseData,
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Tidak ada data pengeluaran untuk periode ini", 14, yPosition + 10);
      yPosition += 20;
    }
    
    // Transactions summary
    if (report.transactions.length > 0 || report.expenses.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("Ringkasan Transaksi", 14, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${report.transactions.length} transaksi pendapatan, ${report.expenses.length} transaksi pengeluaran`,
        14,
        yPosition + 7
      );
      
      // If needed, add a second page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition += 15;
      }
      
      // Latest transactions
      if (report.transactions.length > 0) {
        const transactionRows = report.transactions
          .slice(0, 5)
          .map((t: Transaction) => [
            format(t.transactionDate, 'dd/MM/yyyy', { locale: id }),
            t.patientName || "Umum",
            formatCurrency(t.total)
          ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Tanggal', 'Pasien', 'Jumlah']],
          body: transactionRows,
          headStyles: { fillColor: [46, 125, 50], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: 14, right: 14 }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Latest expenses
      if (report.expenses.length > 0) {
        const expenseRows = report.expenses
          .slice(0, 5)
          .map((e: Expense) => [
            format(e.date, 'dd/MM/yyyy', { locale: id }),
            e.name,
            e.category,
            formatCurrency(e.amount)
          ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Tanggal', 'Nama', 'Kategori', 'Jumlah']],
          body: expenseRows,
          headStyles: { fillColor: [211, 47, 47], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: 14, right: 14 }
        });
      }
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
    
    const pdfName = `laporan-keuangan-${report.periodLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(pdfName);
  };

  const printReport = (report: any) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: id });
    
    // Add title and date - same as PDF generation
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("Laporan Keuangan", 105, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(report.periodLabel, 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Dicetak pada: ${dateStr}`, 105, 28, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    
    // Summary section - same as PDF generation
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Ringkasan", 14, 40);

    // Summary cards - same as PDF generation
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(14, 45, 55, 25, 2, 2, "F");
    doc.roundedRect(75, 45, 55, 25, 2, 2, "F");
    doc.roundedRect(136, 45, 55, 25, 2, 2, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Total Pendapatan", 42, 52, { align: "center" });
    doc.text("Total Pengeluaran", 103, 52, { align: "center" });
    doc.text("Saldo", 164, 52, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(46, 125, 50);
    doc.text(formatCurrency(report.totalIncome), 42, 62, { align: "center" });
    
    doc.setTextColor(211, 47, 47);
    doc.text(formatCurrency(report.totalExpenses), 103, 62, { align: "center" });
    
    doc.setTextColor(report.balance >= 0 ? 46 : 211, report.balance >= 0 ? 125 : 47, report.balance >= 0 ? 50 : 47);
    doc.text(formatCurrency(report.balance), 164, 62, { align: "center" });
    
    // Rest of the report generation is the same as PDF generation
    let yPosition = 80;
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Pendapatan berdasarkan Kategori", 14, yPosition);
    
    yPosition += 5;
    
    const incomeData = Object.entries(report.incomeByCategory).map(([category, amount]) => [
      category, formatCurrency(amount as number)
    ]);
    
    if (incomeData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Kategori', 'Jumlah']],
        body: incomeData,
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Tidak ada data pendapatan untuk periode ini", 14, yPosition + 10);
      yPosition += 20;
    }
    
    // Expense by category
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Pengeluaran berdasarkan Kategori", 14, yPosition);
    
    yPosition += 5;
    
    const expenseData = Object.entries(report.expensesByCategory).map(([category, amount]) => [
      category, formatCurrency(amount as number)
    ]);
    
    if (expenseData.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [['Kategori', 'Jumlah']],
        body: expenseData,
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Tidak ada data pengeluaran untuk periode ini", 14, yPosition + 10);
      yPosition += 20;
    }
    
    // Transactions summary
    if (report.transactions.length > 0 || report.expenses.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text("Ringkasan Transaksi", 14, yPosition);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${report.transactions.length} transaksi pendapatan, ${report.expenses.length} transaksi pengeluaran`,
        14,
        yPosition + 7
      );
      
      // If needed, add a second page
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition += 15;
      }
      
      // Latest transactions
      if (report.transactions.length > 0) {
        const transactionRows = report.transactions
          .slice(0, 5)
          .map((t: Transaction) => [
            format(t.transactionDate, 'dd/MM/yyyy', { locale: id }),
            t.patientName || "Umum",
            formatCurrency(t.total)
          ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Tanggal', 'Pasien', 'Jumlah']],
          body: transactionRows,
          headStyles: { fillColor: [46, 125, 50], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: 14, right: 14 }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Latest expenses
      if (report.expenses.length > 0) {
        const expenseRows = report.expenses
          .slice(0, 5)
          .map((e: Expense) => [
            format(e.date, 'dd/MM/yyyy', { locale: id }),
            e.name,
            e.category,
            formatCurrency(e.amount)
          ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Tanggal', 'Nama', 'Kategori', 'Jumlah']],
          body: expenseRows,
          headStyles: { fillColor: [211, 47, 47], textColor: 255 },
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: 14, right: 14 }
        });
      }
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Auto print the document
    doc.autoPrint();
    
    // Open print dialog
    doc.output('dataurlnewwindow', { filename: 'laporan-keuangan.pdf' });
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => printReport(report)}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Cetak
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF(report)}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadReport(report, report.periodLabel.replace(/\s+/g, '-').toLowerCase())}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground my-4">
                Unduh laporan lengkap untuk melihat data transaksi secara detail
              </p>
              <div className="flex justify-center space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => printReport(report)}
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Laporan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePDF(report)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Unduh PDF
                </Button>
              </div>
            </div>
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
              {format(date, 'PPP', { locale: id })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="mb-4">
          <TabsTrigger value="daily" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Harian</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Mingguan</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bulanan</TabsTrigger>
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
