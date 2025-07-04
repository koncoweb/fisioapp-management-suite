
import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wallet } from 'lucide-react';

interface PaymentDetailsProps {
  total: number;
  finalTotal: number;
  paymentAmount: number;
  changeAmount: number;
  category?: string;
  paymentMethod?: string;
  note?: string;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ 
  total, 
  finalTotal,
  paymentAmount, 
  changeAmount,
  category = 'Lain-lain',
  paymentMethod = 'Tunai',
  note = ''
}) => {
  
  return (
    <div className="space-y-1 text-xs print:text-sm">
      {/* Kategori Transaksi */}
      {category && (
        <div className="flex justify-between items-center bg-muted/20 rounded-sm px-1 py-0.5">
          <span className="font-medium">Kategori:</span>
          <span>{category}</span>
        </div>
      )}
      
      {/* Metode Pembayaran */}
      {paymentMethod && (
        <div className="flex justify-between items-center bg-muted/20 rounded-sm px-1 py-0.5 mt-1">
          <span className="font-medium">Metode:</span>
          <span>{paymentMethod}</span>
        </div>
      )}
      
      {/* Catatan Transaksi (jika ada) */}
      {note && note.trim() !== '' && (
        <div className="text-xs print:text-xs">
          <span className="font-medium">Catatan:</span> 
          <span className="text-muted-foreground">{note}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Total</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      <div className="flex justify-between font-bold border-t border-b py-1 my-1 text-sm print:text-base">
        <span>TOTAL</span>
        <span>{formatRupiah(finalTotal)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span>{paymentMethod}</span>
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
