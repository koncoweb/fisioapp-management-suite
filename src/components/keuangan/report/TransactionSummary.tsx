
import React from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportData } from "./reportUtils";
import { generatePDF, printReport } from "./pdfGenerator";

interface TransactionSummaryProps {
  report: ReportData;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ report }) => {
  return (
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
  );
};
