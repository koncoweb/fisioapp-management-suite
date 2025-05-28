
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Receipt, Wallet } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface CartFooterProps {
  total: number;
  hasItems: boolean;
  onProcessPayment: (paymentAmount: number, changeAmount: number) => void;
  onClearCart: () => void;
  isProcessing?: boolean;
}

const CartFooter: React.FC<CartFooterProps> = ({ 
  total, 
  hasItems, 
  onProcessPayment, 
  onClearCart,
  isProcessing = false
}) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  
  // Total langsung dari props tanpa diskon dan pajak
  const finalTotal = total;
  
  const numericPayment = Number(paymentAmount.replace(/[^\d]/g, '')) || 0;
  const changeAmount = numericPayment - finalTotal;
  const canProceed = numericPayment >= finalTotal && hasItems;

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Keep only digits
    const numericValue = value.replace(/[^\d]/g, '');
    setPaymentAmount(numericValue);
  };

  const handleProcessClick = () => {
    if (!showPaymentInput) {
      setShowPaymentInput(true);
      setPaymentAmount(finalTotal.toString()); // Set default amount to final total
      return;
    }
    
    // If already showing payment input and amount is valid, process payment
    if (canProceed) {
      onProcessPayment(numericPayment, changeAmount);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center font-semibold">
        <span>Subtotal</span>
        <span>{formatRupiah(total)}</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Total</span>
          <span className="font-medium">
            {formatRupiah(finalTotal)}
          </span>
        </div>
      </div>
      
      {showPaymentInput && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <label htmlFor="payment" className="text-xs text-muted-foreground">
                Jumlah Pembayaran
              </label>
              <Input
                id="payment"
                value={formatRupiah(numericPayment)}
                onChange={handlePaymentInputChange}
                className="mt-1"
                placeholder="Masukkan jumlah pembayaran"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Kembalian</span>
            <span className={changeAmount >= 0 ? "text-green-600" : "text-red-600"}>
              {formatRupiah(changeAmount)}
            </span>
          </div>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={handleProcessClick} 
          className="flex-1" 
          disabled={showPaymentInput ? !canProceed : !hasItems || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4 mr-1" />
              {showPaymentInput ? 'Proses Pembayaran' : 'Bayar'}
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            if (showPaymentInput) {
              setShowPaymentInput(false);
            } else {
              onClearCart();
            }
          }}
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartFooter;
