
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Package, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {products.length === 0 && (
        <div className="col-span-full text-center py-4 text-muted-foreground text-xs">
          No products or services available
        </div>
      )}
      
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-all duration-200 border-border glass-card h-full">
            <CardContent className={`p-2 ${isMobile ? 'pb-0.5' : 'pb-1'}`}>
              <div className="flex items-center justify-center h-16 bg-secondary/30 rounded-md mb-1">
                {product.type === 'product' ? (
                  <Package className="h-8 w-8 text-blue-500 opacity-70" />
                ) : (
                  <Clock className="h-8 w-8 text-orange-500 opacity-70" />
                )}
              </div>
              <h3 className="font-medium text-xs truncate">{product.name}</h3>
              <div className="mt-0.5">
                <p className="text-xs font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{product.type}</p>
                {product.type === 'service' && product.duration && (
                  <p className="text-[10px] text-muted-foreground">{product.duration} min</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="px-2 py-1 border-t bg-muted/30">
              <Button 
                onClick={() => onAddToCart(product)} 
                className="w-full h-6 text-[10px]"
                variant={product.type === 'service' ? "outline" : "default"}
                size="sm"
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                {product.type === 'service' ? 'Select' : 'Add'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductGrid;
