
import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductGrid from '@/components/pos/ProductGrid';
import ShoppingCart from '@/components/pos/ShoppingCart';
import TherapyVariantSelector from '@/components/pos/TherapyVariantSelector';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/use-products';
import { useShoppingCart } from '@/hooks/use-shopping-cart';

const PointOfSale = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, isLoading } = useProducts();
  const { 
    cart, 
    handleVariantSelect, 
    addToCart, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart, 
    calculateTotal 
  } = useShoppingCart();

  const handleProductSelect = (product: Product) => {
    // Only show variant selector for service (therapy) products
    if (product.type === 'service') {
      setSelectedProduct(product);
    } else {
      // For regular products, add directly to cart
      addToCart(product);
    }
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
            <CardTitle>Produk & Layanan</CardTitle>
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
              <CardTitle>Keranjang Belanja</CardTitle>
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
