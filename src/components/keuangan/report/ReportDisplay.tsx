
import React from "react";
import { ReportData } from "./reportUtils";
import { ReportHeader } from "./ReportHeader";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { TransactionSummary } from "./TransactionSummary";

interface ReportDisplayProps {
  report: ReportData | null;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="space-y-6">
      <ReportHeader report={report} />

      <ReportSummaryCards report={report} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryBreakdown
          title="Pendapatan berdasarkan Kategori"
          description="Rincian sumber pendapatan"
          categories={report.incomeByCategory}
          type="income"
        />
        <CategoryBreakdown
          title="Pengeluaran berdasarkan Kategori"
          description="Rincian kategori pengeluaran"
          categories={report.expensesByCategory}
          type="expense"
        />
      </div>

      <TransactionSummary report={report} />
    </div>
  );
};
