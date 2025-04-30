
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductGrid from '@/components/pos/ProductGrid';
import ShoppingCart from '@/components/pos/ShoppingCart';
import TherapyVariantSelector from '@/components/pos/TherapyVariantSelector';
import { toast } from "@/components/ui/sonner";
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export interface CartItem extends Product {
  quantity: number;
  isPackage?: boolean;
  appointmentDate?: Date;
  appointmentTime?: string;
}

const PointOfSale = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    }
  });

  const handleProductSelect = (product: Product) => {
    // Only show variant selector for service (therapy) products
    if (product.type === 'service') {
      setSelectedProduct(product);
    } else {
      // For regular products, add directly to cart
      addToCart(product);
    }
  };

  const handleVariantSelect = (
    product: Product, 
    isPackage: boolean, 
    appointmentDate?: Date, 
    appointmentTime?: string
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
    
    // If date and time are selected, append to the name
    if (appointmentDate && appointmentTime) {
      const formattedDate = format(appointmentDate, "dd MMM yyyy");
      customProduct.name = `${customProduct.name} - ${formattedDate} at ${appointmentTime}`;
    }
    
    addToCart(customProduct, isPackage, appointmentDate, appointmentTime);
    setSelectedProduct(null);
  };

  const addToCart = (
    product: Product, 
    isPackage = false, 
    appointmentDate?: Date, 
    appointmentTime?: string
  ) => {
    setCart(currentCart => {
      // Generate a unique ID for the cart item that includes the date and time if it's a service
      const uniqueId = product.type === 'service' && appointmentDate && appointmentTime
        ? `${product.id}-${appointmentDate.toISOString()}-${appointmentTime}`
        : isPackage 
          ? `${product.id}-package` 
          : product.id;
      
      // For services with appointment, always add as a new item
      if (product.type === 'service' && appointmentDate && appointmentTime) {
        const newItem = { 
          ...product, 
          quantity: 1, 
          isPackage,
          appointmentDate,
          appointmentTime,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Grid */}
        <Card className="w-full md:w-2/3 glass-card">
          <CardHeader>
            <CardTitle>Products & Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductGrid 
              products={products || []} 
              onAddToCart={handleProductSelect} 
            />
          </CardContent>
        </Card>
        
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {/* Therapy Variant Selector */}
          {selectedProduct && (
            <TherapyVariantSelector 
              product={selectedProduct} 
              onSelectVariant={handleVariantSelect}
              onCancel={() => setSelectedProduct(null)}
            />
          )}
          
          {/* Shopping Cart */}
          <Card className="w-full glass-card">
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <ShoppingCart 
                items={cart}
                updateQuantity={updateCartItemQuantity}
                removeItem={removeFromCart}
                clearCart={clearCart}
                total={calculateTotal()}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default PointOfSale;
