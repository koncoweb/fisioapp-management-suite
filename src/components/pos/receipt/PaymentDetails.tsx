
import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface PaymentDetailsProps {
  total: number;
  paymentAmount: number;
  changeAmount: number;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  total, 
  paymentAmount, 
  changeAmount 
}) => {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between">
        <span>Total</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Wallet className="h-3 w-3 mr-1 text-muted-foreground" /> 
          <span>Tunai</span>
        </div>
        <span>{formatRupiah(paymentAmount)}</span>
      </div>
      
      <div className="flex justify-between font-medium">
        <span>Kembalian</span>
        <span>{formatRupiah(changeAmount)}</span>
      </div>
    </div>
  );
};

export default PaymentDetails;
