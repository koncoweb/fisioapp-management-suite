
import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface PaymentDetailsProps {
  total: number;
  finalTotal: number;
  paymentAmount: number;
  changeAmount: number;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  total, 
  finalTotal,
  paymentAmount, 
  changeAmount 
}) => {
  
  return (
    <div className="space-y-1 text-xs print:text-sm">
      <div className="flex justify-between">
        <span>Total</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      <div className="flex justify-between font-bold border-t border-b py-1 my-1 text-sm print:text-base">
        <span>TOTAL</span>
        <span>{formatRupiah(finalTotal)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span>Tunai</span>
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
