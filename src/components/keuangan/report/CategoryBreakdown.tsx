
import React from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CategoryBreakdownProps {
  title: string;
  description: string;
  categories: Record<string, number>;
  type: "income" | "expense";
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  title,
  description,
  categories,
  type,
}) => {
  const textColorClass = type === "income" ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(categories).length > 0 ? (
          <ul className="space-y-2">
            {Object.entries(categories).map(([category, amount]) => (
              <li key={category} className="flex justify-between items-center">
                <span className={type === "income" ? "capitalize" : ""}>{category}</span>
                <span className={`font-medium ${textColorClass}`}>{formatCurrency(amount as number)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Tidak ada data {type === "income" ? "pendapatan" : "pengeluaran"} untuk periode ini
          </p>
        )}
      </CardContent>
    </Card>
  );
};
