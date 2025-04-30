
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Calendar, TrendingUp, Clock } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: number;
  description?: string;
  footer?: string;
  className?: string;
  loading?: boolean;
  type?: 'income' | 'expense' | 'balance';
  period?: 'day' | 'week' | 'month';
}

export const StatisticsCard = ({
  title,
  value,
  description,
  footer,
  className,
  loading = false,
  type = 'income',
  period
}: StatisticsCardProps) => {
  const colorMap = {
    income: 'text-green-600',
    expense: 'text-red-600',
    balance: value >= 0 ? 'text-green-600' : 'text-red-600'
  };
  
  const periodMap = {
    day: {
      icon: Clock,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    week: {
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    month: {
      icon: Calendar,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  };
  
  const textColor = colorMap[type];
  const PeriodIcon = period ? periodMap[period].icon : null;
  const cardStyles = period ? 
    `${className} ${periodMap[period].bgColor} ${periodMap[period].borderColor} border-2` : 
    className;
  
  return (
    <Card className={cardStyles}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {PeriodIcon && <PeriodIcon className="h-4 w-4 opacity-70" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 bg-muted animate-pulse rounded"></div>
        ) : (
          <div className="text-2xl font-bold tracking-tight">
            <span className={textColor}>{formatCurrency(value)}</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
      {footer && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">{footer}</p>
        </CardFooter>
      )}
    </Card>
  );
};
