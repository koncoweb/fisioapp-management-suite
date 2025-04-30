
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Package, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onSelectProduct }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {products.length === 0 && (
        <div className="col-span-full text-center py-6 text-gray-500 text-sm">
          No products or services available
        </div>
      )}
      
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow border-gray-200 cursor-pointer"
          onClick={() => onSelectProduct ? onSelectProduct(product) : onAddToCart(product)}
        >
          <CardContent className={`p-1 ${isMobile ? 'pb-1' : 'pb-1'}`}>
            <div className="flex items-center justify-center h-16 bg-gray-100 rounded-md mb-1">
              {product.type === 'product' ? (
                <Package className="h-8 w-8 text-primary opacity-50" />
              ) : (
                <Clock className="h-8 w-8 text-secondary opacity-50" />
              )}
            </div>
            <h3 className="font-medium text-xs truncate">{product.name}</h3>
            <p className="text-[10px] font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
            <p className="text-[8px] text-muted-foreground capitalize">{product.type}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
