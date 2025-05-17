
import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wallet, BadgePercent, Receipt } from 'lucide-react';

interface PaymentDetailsProps {
  total: number;
  discount?: number;
  tax?: number;
  finalTotal: number;
  paymentAmount: number;
  changeAmount: number;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  total, 
  discount = 0,
  tax = 0,
  finalTotal,
  paymentAmount, 
  changeAmount 
}) => {
  const taxAmount = (total - discount) * (tax / 100);
  
  return (
    <div className="space-y-1 text-xs print:text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between items-center text-green-600">
          <span>Diskon</span>
          <span>- {formatRupiah(discount)}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span>Pajak ({tax}%)</span>
        <span>{formatRupiah(taxAmount)}</span>
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
