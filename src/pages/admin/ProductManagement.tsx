
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import ProductForm from '@/components/products/ProductForm';
import ProductList from '@/components/products/ProductList';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useToast } from "@/components/ui/use-toast";

const ProductManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { addMutation, updateMutation, deleteMutation } = useProductMutations();
  const { toast } = useToast();

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
    return (
      <div className="flex items-center justify-center p-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Products & Services Management</CardTitle>
            <CardDescription>Manage your clinic's products and services catalog</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
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
                        toast({
                          title: "Success",
                          description: "Product updated successfully",
                        });
                      }
                    });
                  } else {
                    addMutation.mutate(data, {
                      onSuccess: () => {
                        setIsOpen(false);
                        toast({
                          title: "Success",
                          description: "Product added successfully",
                        });
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
