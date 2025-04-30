
import React, { useRef, useState } from 'react';
import { CartItem } from '@/types/pos';
import CartItemList from './cart/CartItemList';
import CartFooter from './cart/CartFooter';
import PaymentProcessor, { PaymentProcessorHandle } from './cart/PaymentProcessor';

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
  const [isProcessingPatient, setIsProcessingPatient] = useState(false);
  const paymentProcessorRef = useRef<PaymentProcessorHandle>(null);

  // This will be called by CartFooter when payment process should start
  const handleProcessPayment = (paymentAmount: number, changeAmount: number, discount: number, tax: number) => {
    setIsProcessingPatient(true);
    paymentProcessorRef.current?.handleProcessPayment(paymentAmount, changeAmount, discount, tax);
    // Reset the processing state after a delay
    setTimeout(() => setIsProcessingPatient(false), 600);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto max-h-[400px]">
        <CartItemList 
          items={items} 
          updateQuantity={updateQuantity} 
          removeItem={removeItem} 
        />
      </div>

      <CartFooter
        total={total}
        hasItems={items.length > 0}
        onProcessPayment={handleProcessPayment}
        onClearCart={clearCart}
        isProcessing={isProcessingPatient}
      />

      {/* PaymentProcessor handles patient selection and receipt display */}
      <PaymentProcessor
        ref={paymentProcessorRef}
        items={items}
        total={total}
        clearCart={clearCart}
      />
    </div>
  );
};

export default ShoppingCart;
