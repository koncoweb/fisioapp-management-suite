
import React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportData } from "./reportUtils";
import { downloadReport } from "./reportUtils";
import { generatePDF, printReport } from "./pdfGenerator";

interface ReportHeaderProps {
  report: ReportData;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report }) => {
  return (
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
  );
};
