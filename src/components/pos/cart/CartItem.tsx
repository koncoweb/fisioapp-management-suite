
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, Calendar, Clock } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/pos';
import { format } from "date-fns";

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  updateQuantity, 
  removeItem 
}) => {
  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      updateQuantity(item.id, quantity);
    }
  };

  return (
    <li className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-1.5 rounded-md">
      <div className="flex-grow min-w-0 pr-1">
        <h4 className="font-medium text-[10px] truncate">{item.name}</h4>
        <p className="text-[10px] text-muted-foreground">
          Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
        </p>
        
        {/* Show appointment details if available */}
        {item.appointmentDate && item.appointmentTime && (
          <div className="flex items-center mt-0.5 text-[9px] text-muted-foreground">
            <Calendar className="h-2 w-2 mr-0.5" />
            <span className="mr-1">{format(item.appointmentDate, "dd MMM")}</span>
            <Clock className="h-2 w-2 mr-0.5" />
            <span>{item.appointmentTime}</span>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <div className="flex items-center border rounded-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-2.5 w-2.5" />
            <span className="sr-only">Decrease</span>
          </Button>
          <Input
            type="text"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="h-5 w-6 text-center border-0 p-0 text-[10px]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-2.5 w-2.5" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="h-2.5 w-2.5" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </li>
  );
};

export default CartItem;
