
import { useState } from "react";
import { useTransactions, useExpenses } from "@/hooks/use-transactions";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ReportDisplay } from "./report/ReportDisplay";
import {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport
} from "./report/reportUtils";

export const ReportGenerator = () => {
  const { data: transactions = [] } = useTransactions();
  const { data: expenses = [] } = useExpenses();
  const [date, setDate] = useState<Date>(new Date());

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
          <TabsTrigger value="daily" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Harian
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Mingguan
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs md:text-sm font-medium bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Bulanan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <ReportDisplay report={generateDailyReport(date, transactions, expenses)} />
        </TabsContent>
        
        <TabsContent value="weekly">
          <ReportDisplay report={generateWeeklyReport(date, transactions, expenses)} />
        </TabsContent>
        
        <TabsContent value="monthly">
          <ReportDisplay report={generateMonthlyReport(date, transactions, expenses)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
