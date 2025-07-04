
import React from 'react';
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

interface ReceiptInfoProps {
  receiptNo: string;
  transactionDate: Date;
}

const ReceiptInfo: React.FC<ReceiptInfoProps> = ({ 
  receiptNo, 
  transactionDate
}) => {
  return (
    <div className="text-xs print:text-sm">
      <div className="flex justify-between">
        <span>No. Struk</span>
        <span className="font-medium">{receiptNo}</span>
      </div>
      <div className="flex justify-between mb-1">
        <span>Tanggal</span>
        <span>{format(transactionDate, 'dd/MM/yyyy HH:mm')}</span>
      </div>
    </div>
  );
};

export default ReceiptInfo;
