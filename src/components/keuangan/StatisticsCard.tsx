
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface StatisticsCardProps {
  title: string;
  value: number;
  description?: string;
  footer?: string;
  className?: string;
  loading?: boolean;
  type?: 'income' | 'expense' | 'balance';
}

export const StatisticsCard = ({
  title,
  value,
  description,
  footer,
  className,
  loading = false,
  type = 'income'
}: StatisticsCardProps) => {
  const colorMap = {
    income: 'text-green-600',
    expense: 'text-red-600',
    balance: value >= 0 ? 'text-green-600' : 'text-red-600'
  };
  
  const textColor = colorMap[type];
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
