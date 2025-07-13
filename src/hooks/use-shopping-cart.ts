
import { useState } from 'react';
import { Product } from '@/types/product';
import { AppointmentSlot, CartItem } from '@/types/pos';
import { Employee } from '@/types';

import { toast } from "sonner";

export const useShoppingCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const handleVariantSelect = (
    product: Product, 
    isPackage: boolean, 
    appointments: AppointmentSlot[],
    therapist: Employee
  ) => {
    const customProduct = { ...product };
    
    if (isPackage) {
      // For package: 4 times the price - 200,000
      const packagePrice = (product.price * 4) - 200000;
      customProduct.name = `${product.name} (Package - 4 visits)`;
      customProduct.price = packagePrice;
    } else {
      customProduct.name = `${product.name} (Single visit)`;
    }
    
    addToCart(customProduct, isPackage, appointments, therapist);
  };

  const addToCart = (
    product: Product, 
    isPackage = false, 
    appointments: AppointmentSlot[] = [],
    therapist?: Employee
  ) => {
    setCart(currentCart => {
      // Generate a unique ID for the cart item
      let uniqueId = product.id;
      
      if (isPackage) {
        uniqueId = `${product.id}-package`;
      }
      
      // For services, always add as a new item
      if (product.type === 'service') {
        const newItem = { 
          ...product, 
          quantity: 1, 
          isPackage,
          appointments,
          therapist,        // Add therapist to the cart item
          id: uniqueId
        };
        return [...currentCart, newItem];
      }
      
      // For other products, check if they already exist in cart
      const existingItemIndex = currentCart.findIndex(item => 
        isPackage ? item.id === `${product.id}-package` : item.id === product.id && !item.isPackage
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if product exists
        const newCart = [...currentCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
        return newCart;
      } else {
        // Add new product with quantity 1
        const newItem = { 
          ...product, 
          quantity: 1, 
          isPackage,
          id: uniqueId
        };
        return [...currentCart, newItem];
      }
    });
    
    toast(`${product.name} added to cart`);
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(currentCart => 
      currentCart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
    toast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
    toast("Cart cleared");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    cart,
    addToCart,
    handleVariantSelect,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    calculateTotal
  };
};
