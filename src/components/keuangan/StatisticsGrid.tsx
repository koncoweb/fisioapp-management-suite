
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { StatisticsCard } from "./StatisticsCard";
import { Badge } from "@/components/ui/badge";

export const StatisticsGrid = () => {
  const { data: dailyData, isLoading: isDailyLoading } = useFinancialSummary('day');
  const { data: weeklyData, isLoading: isWeeklyLoading } = useFinancialSummary('week');
  const { data: monthlyData, isLoading: isMonthlyLoading } = useFinancialSummary('month');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Today</h3>
          <Badge variant="outline" className="bg-blue-50">Daily</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={dailyData?.income || 0} 
            loading={isDailyLoading} 
            type="income"
            period="day"
            description={dailyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={dailyData?.expenses || 0} 
            loading={isDailyLoading} 
            type="expense"
            period="day"
            description={dailyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={dailyData?.balance || 0} 
            loading={isDailyLoading} 
            type="balance"
            period="day"
            description={dailyData?.period} 
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">This Week</h3>
          <Badge variant="outline" className="bg-purple-50">Weekly</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={weeklyData?.income || 0} 
            loading={isWeeklyLoading} 
            type="income"
            period="week"
            description={weeklyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={weeklyData?.expenses || 0} 
            loading={isWeeklyLoading} 
            type="expense"
            period="week"
            description={weeklyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={weeklyData?.balance || 0} 
            loading={isWeeklyLoading} 
            type="balance"
            period="week"
            description={weeklyData?.period}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">This Month</h3>
          <Badge variant="outline" className="bg-amber-50">Monthly</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={monthlyData?.income || 0} 
            loading={isMonthlyLoading} 
            type="income"
            period="month"
            description={monthlyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={monthlyData?.expenses || 0} 
            loading={isMonthlyLoading} 
            type="expense"
            period="month"
            description={monthlyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={monthlyData?.balance || 0} 
            loading={isMonthlyLoading} 
            type="balance"
            period="month"
            description={monthlyData?.period}
          />
        </div>
      </div>
    </div>
  );
};
