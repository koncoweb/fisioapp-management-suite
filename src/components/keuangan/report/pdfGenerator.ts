import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReportData } from "./reportUtils";
import { formatCurrency } from "@/lib/utils";
import { Transaction, Expense } from "@/types/keuangan";

export const generatePDF = (report: ReportData) => {
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

export const printReport = (report: ReportData) => {
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
