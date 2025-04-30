
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface CartFooterProps {
  total: number;
  hasItems: boolean;
  onProcessPayment: () => void;
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
  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center font-semibold">
        <span>Total</span>
        <span>Rp {total.toLocaleString('id-ID')}</span>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={onProcessPayment} 
          className="flex-1" 
          disabled={!hasItems || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Process Payment'
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onClearCart}
          disabled={!hasItems || isProcessing}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartFooter;
