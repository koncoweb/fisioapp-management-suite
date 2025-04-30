
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CartFooterProps {
  total: number;
  onProcessPayment: () => void;
  onClearCart: () => void;
  hasItems: boolean;
}

const CartFooter: React.FC<CartFooterProps> = ({
  total,
  onProcessPayment,
  onClearCart,
  hasItems
}) => {
  if (!hasItems) return null;

  return (
    <div className="mt-2">
      <Separator className="my-1.5" />
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-semibold text-xs">Total</span>
        <span className="text-sm font-bold">Rp {total.toLocaleString('id-ID')}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <Button 
          variant="default" 
          size="sm"
          onClick={onProcessPayment}
          className="w-full text-xs h-7"
        >
          Process Payment
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={onClearCart} 
          className="w-full text-xs h-7"
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartFooter;
