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

export interface AppointmentSlot {
  date: Date;
  time: string;
}

export interface CartItem extends Product {
  quantity: number;
  isPackage?: boolean;
  appointments?: AppointmentSlot[];
  appointmentDate?: Date;  // Kept for backward compatibility
  appointmentTime?: string; // Kept for backward compatibility
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
    appointments: AppointmentSlot[]
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
    
    // For single visit, format name with date/time
    if (!isPackage && appointments.length === 1) {
      const { date, time } = appointments[0];
      const formattedDate = format(date, "dd MMM yyyy");
      customProduct.name = `${customProduct.name} - ${formattedDate} at ${time}`;
    }
    
    addToCart(customProduct, isPackage, appointments);
    setSelectedProduct(null);
  };

  const addToCart = (
    product: Product, 
    isPackage = false, 
    appointments: AppointmentSlot[] = []
  ) => {
    setCart(currentCart => {
      // Generate a unique ID for the cart item
      let uniqueId = product.id;
      
      // For services with appointments
      if (product.type === 'service' && appointments.length > 0) {
        if (isPackage) {
          uniqueId = `${product.id}-package-${Date.now()}`;
        } else {
          const { date, time } = appointments[0];
          uniqueId = `${product.id}-${date.toISOString()}-${time}`;
        }
      } else if (isPackage) {
        uniqueId = `${product.id}-package`;
      }
      
      // For services with appointments, always add as a new item
      if (product.type === 'service' && appointments.length > 0) {
        // For backward compatibility
        const appointmentDate = appointments.length > 0 ? appointments[0].date : undefined;
        const appointmentTime = appointments.length > 0 ? appointments[0].time : undefined;
        
        const newItem = { 
          ...product, 
          quantity: 1, 
          isPackage,
          appointments,
          appointmentDate,  // For backward compatibility
          appointmentTime, // For backward compatibility
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
