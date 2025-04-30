
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';
import ProductGrid from '@/components/pos/ProductGrid';
import ShoppingCart from '@/components/pos/ShoppingCart';
import { toast } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart as CartIcon } from "lucide-react";

export interface CartItem extends Product {
  quantity: number;
}

const PointOfSale = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPricePopup, setShowPricePopup] = useState(false);
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

  const addToCart = (product: Product) => {
    // For product type, directly add to cart
    if (product.type === 'product') {
      addItemToCart(product);
      return;
    }
    
    // For service type, show price popup
    setSelectedProduct(product);
    setShowPricePopup(true);
  };

  const addItemToCart = (product: Product) => {
    setCart(currentCart => {
      // Check if product is already in cart
      const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
      
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
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
    
    toast(`${product.name} added to cart`);
    setShowPricePopup(false);
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
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold text-center border-b border-gray-200 pb-4 mb-6">
        Fit Factory Bandung
      </h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product Grid */}
        <div className="w-full md:w-3/4 bg-white rounded-md border">
          <div className="p-3 border-b">
            <h2 className="text-lg font-bold">Products</h2>
          </div>
          <div className="p-3">
            <ProductGrid 
              products={products || []} 
              onAddToCart={addToCart} 
              onSelectProduct={setSelectedProduct}
            />
          </div>
        </div>
        
        {/* Shopping Cart - Desktop View */}
        <div className="hidden md:block w-full md:w-1/4 bg-white rounded-md border">
          <div className="p-3 border-b">
            <h2 className="text-lg font-bold">Selected Treatment</h2>
          </div>
          <div className="p-3">
            <ShoppingCart 
              items={cart}
              updateQuantity={updateCartItemQuantity}
              removeItem={removeFromCart}
              clearCart={clearCart}
              total={calculateTotal()}
            />
          </div>
        </div>
        
        {/* Mobile Shopping Cart Button */}
        <div className="fixed bottom-4 right-4 md:hidden z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-14 w-14 rounded-full shadow-lg" size="icon">
                <CartIcon className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="p-3">
                <h2 className="text-lg font-bold mb-4">Selected Treatment</h2>
                <ShoppingCart 
                  items={cart}
                  updateQuantity={updateCartItemQuantity}
                  removeItem={removeFromCart}
                  clearCart={clearCart}
                  total={calculateTotal()}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
