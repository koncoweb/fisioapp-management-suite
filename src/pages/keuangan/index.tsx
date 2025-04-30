
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { StatisticsGrid } from "@/components/keuangan/StatisticsGrid";
import { TransactionsTable } from "@/components/keuangan/TransactionsTable";
import { ExpenseForm } from "@/components/keuangan/ExpenseForm";
import { ReportGenerator } from "@/components/keuangan/ReportGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function KeuanganPage() {
  const navigate = useNavigate();
  const { userData, isLoading } = useAuth();
  
  // Only admin should access this page
  useEffect(() => {
    if (!isLoading && userData?.role !== 'admin') {
      navigate('/unauthorized');
    }
  }, [userData, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Manajemen Keuangan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pendapatan, pengeluaran, dan buat laporan keuangan
          </p>
        </div>
        <ExpenseForm />
      </div>
      
      <StatisticsGrid />
      
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions" className="text-sm">Transaksi</TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">Laporan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <TransactionsTable />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-4">
          <ReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
