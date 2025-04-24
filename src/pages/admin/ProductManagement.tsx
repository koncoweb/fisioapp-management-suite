
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from 'lucide-react';
import { Product } from '@/types/product';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from '@/components/products/ProductForm';
import ProductList from '@/components/products/ProductList';
import { useProductMutations } from '@/hooks/useProductMutations';

const ProductManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { addMutation, updateMutation, deleteMutation } = useProductMutations();

  const {
    data: products,
    isLoading,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products & Services Management</CardTitle>
            <CardDescription>Manage your products and services catalog</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit' : 'Add New'} Product/Service</DialogTitle>
                <DialogDescription>
                  Fill in the details below to {editingProduct ? 'update' : 'add'} a product or service.
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={(data) => {
                  if (editingProduct) {
                    updateMutation.mutate({ ...editingProduct, ...data }, {
                      onSuccess: () => {
                        setIsOpen(false);
                        setEditingProduct(null);
                      }
                    });
                  } else {
                    addMutation.mutate(data, {
                      onSuccess: () => {
                        setIsOpen(false);
                      }
                    });
                  }
                }}
                initialData={editingProduct}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ProductList
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setIsOpen(true);
          }}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};

export default ProductManagement;
