
import React from 'react';
import { Product } from '@/types/product';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from 'lucide-react';

interface ProductListProps {
  products?: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Type</TableHead>
            <TableHead>Price (Rp)</TableHead>
            <TableHead className="hidden sm:table-cell">Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                {product.name}
                <span className="block sm:hidden text-xs text-muted-foreground capitalize">
                  {product.type}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell capitalize">{product.type}</TableCell>
              <TableCell>{product.price.toLocaleString('id-ID')}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {product.type === 'service' ? `${product.duration} min` : '-'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(product)}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!products || products.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No products or services found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductList;
