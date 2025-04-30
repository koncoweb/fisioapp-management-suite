
import React from 'react';
import { CartItem } from '@/pages/admin/PointOfSale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

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
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      updateQuantity(id, quantity);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto max-h-[500px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CartIcon className="h-12 w-12 mb-2 opacity-20" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div className="flex-grow">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease</span>
                    </Button>
                    <Input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="h-8 w-12 text-center border-0 p-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <Separator className="my-4" />
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="default" 
              className="w-full"
            >
              Process Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={clearCart} 
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
