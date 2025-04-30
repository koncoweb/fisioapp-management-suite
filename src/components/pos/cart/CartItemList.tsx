
import React from 'react';
import { CartItem as CartItemType } from '@/types/pos';
import CartItem from './CartItem';
import { ShoppingCart } from 'lucide-react';

interface CartItemListProps {
  items: CartItemType[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ 
  items, 
  updateQuantity, 
  removeItem 
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-3 text-center text-muted-foreground">
        <ShoppingCart className="h-6 w-6 mb-1 opacity-20" />
        <p className="text-xs">Your cart is empty</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 text-xs">
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
        />
      ))}
    </ul>
  );
};

export default CartItemList;
