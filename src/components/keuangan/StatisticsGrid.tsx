
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { StatisticsCard } from "./StatisticsCard";

export const StatisticsGrid = () => {
  const { data: dailyData, isLoading: isDailyLoading } = useFinancialSummary('day');
  const { data: weeklyData, isLoading: isWeeklyLoading } = useFinancialSummary('week');
  const { data: monthlyData, isLoading: isMonthlyLoading } = useFinancialSummary('month');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Today</h3>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={dailyData?.income || 0} 
            loading={isDailyLoading} 
            type="income"
            description={dailyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={dailyData?.expenses || 0} 
            loading={isDailyLoading} 
            type="expense"
            description={dailyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={dailyData?.balance || 0} 
            loading={isDailyLoading} 
            type="balance"
            description={dailyData?.period} 
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">This Week</h3>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={weeklyData?.income || 0} 
            loading={isWeeklyLoading} 
            type="income"
            description={weeklyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={weeklyData?.expenses || 0} 
            loading={isWeeklyLoading} 
            type="expense"
            description={weeklyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={weeklyData?.balance || 0} 
            loading={isWeeklyLoading} 
            type="balance"
            description={weeklyData?.period}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">This Month</h3>
        <div className="grid grid-cols-1 gap-4">
          <StatisticsCard 
            title="Income" 
            value={monthlyData?.income || 0} 
            loading={isMonthlyLoading} 
            type="income"
            description={monthlyData?.period}
          />
          <StatisticsCard 
            title="Expenses" 
            value={monthlyData?.expenses || 0} 
            loading={isMonthlyLoading} 
            type="expense"
            description={monthlyData?.period}
          />
          <StatisticsCard 
            title="Balance" 
            value={monthlyData?.balance || 0} 
            loading={isMonthlyLoading} 
            type="balance"
            description={monthlyData?.period}
          />
        </div>
      </div>
    </div>
  );
};
