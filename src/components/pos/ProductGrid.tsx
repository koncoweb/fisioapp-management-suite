
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Package, Clock } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-500">
          No products or services available
        </div>
      )}
      
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md mb-4">
              {product.type === 'product' ? (
                <Package className="h-16 w-16 text-primary opacity-50" />
              ) : (
                <Clock className="h-16 w-16 text-secondary opacity-50" />
              )}
            </div>
            <h3 className="font-medium text-lg truncate">{product.name}</h3>
            <div className="mt-2">
              <p className="text-lg font-semibold">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-sm text-muted-foreground capitalize">{product.type}</p>
              {product.type === 'service' && product.duration && (
                <p className="text-xs text-muted-foreground">{product.duration} minutes</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-3 border-t bg-gray-50/50">
            <Button 
              onClick={() => onAddToCart(product)} 
              className="w-full"
              variant="default"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
