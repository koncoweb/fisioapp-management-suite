
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportData } from "./reportUtils";

interface ReportSummaryCardsProps {
  report: ReportData;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ report }) => {
  return (
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
  );
};
