
import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wallet, BadgePercent } from 'lucide-react';

interface PaymentDetailsProps {
  total: number;
  discount?: number;
  finalTotal: number;
  paymentAmount: number;
  changeAmount: number;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  total, 
  discount = 0,
  finalTotal,
  paymentAmount, 
  changeAmount 
}) => {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      {discount > 0 && (
        <div className="flex justify-between items-center text-green-600">
          <div className="flex items-center">
            <BadgePercent className="h-3 w-3 mr-1" /> 
            <span>Diskon</span>
          </div>
          <span>- {formatRupiah(discount)}</span>
        </div>
      )}
      
      <div className="flex justify-between font-medium border-t pt-1">
        <span>Total</span>
        <span>{formatRupiah(finalTotal)}</span>
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
