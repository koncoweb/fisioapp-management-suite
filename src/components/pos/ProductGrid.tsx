
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Package, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
      {products.length === 0 && (
        <div className="col-span-full text-center py-6 text-gray-500 text-sm">
          No products or services available
        </div>
      )}
      
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow border-gray-200">
          <CardContent className={`p-2 ${isMobile ? 'pb-1' : 'pb-2'}`}>
            <div className="flex items-center justify-center h-20 bg-gray-50 rounded-md mb-1">
              {product.type === 'product' ? (
                <Package className="h-10 w-10 text-primary opacity-50" />
              ) : (
                <Clock className="h-10 w-10 text-secondary opacity-50" />
              )}
            </div>
            <h3 className="font-medium text-xs sm:text-sm truncate">{product.name}</h3>
            <div className="mt-0.5">
              <p className="text-sm font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-xs text-muted-foreground capitalize">{product.type}</p>
              {product.type === 'service' && product.duration && (
                <p className="text-xs text-muted-foreground">{product.duration} min</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-2 py-1 border-t bg-gray-50/50">
            <Button 
              onClick={() => onAddToCart(product)} 
              className="w-full h-8 text-xs"
              variant="default"
              size="sm"
            >
              <ShoppingCart className="mr-1 h-3 w-3" />
              Add
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
