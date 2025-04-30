
import React, { useState } from 'react';
import { CartItem } from '@/pages/admin/PointOfSale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import PaymentReceipt from './PaymentReceipt';

interface ShoppingCartProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  items, 
  updateQuantity, 
  removeItem, 
  clearCart,
  total
}) => {
  const [receiptOpen, setReceiptOpen] = useState(false);
  
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      updateQuantity(id, quantity);
    }
  };

  const handleProcessPayment = () => {
    setReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptOpen(false);
    clearCart();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto max-h-[400px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
            <CartIcon className="h-8 w-8 mb-1 opacity-20" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <ul className="space-y-1 text-xs">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-xs truncate">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-3">
          <Separator className="my-2" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Total:</span>
            <span className="text-base font-bold">(Nominal Harga)</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="default" 
              size="sm"
              className="w-full text-sm h-8 bg-black text-white hover:bg-black/90"
            >
              Payment Method
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleProcessPayment} 
              className="w-full text-sm h-8"
            >
              Print Receipt
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={clearCart} 
              className="w-full text-sm h-8 mt-2"
            >
              Clear Scale
            </Button>
          </div>
        </div>
      )}

      <PaymentReceipt
        isOpen={receiptOpen}
        onClose={handleCloseReceipt}
        items={items}
        total={total}
      />
    </div>
  );
};

export default ShoppingCart;
