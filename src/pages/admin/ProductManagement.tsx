
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Package, Edit, Trash2 } from 'lucide-react';
import { Product, ProductType } from '@/types/product';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const addMutation = useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'products'), {
        ...newProduct,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product added successfully" });
      setIsOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (product: Product) => {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product updated successfully" });
      setIsOpen(false);
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Success", description: "Product deleted successfully" });
    },
  });

  const ProductForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: editingProduct?.name || '',
      type: editingProduct?.type || 'product' as ProductType,
      price: editingProduct?.price || 0,
      duration: editingProduct?.duration || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product/Service Name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Select
              value={formData.type}
              onValueChange={value => setFormData({ ...formData, type: value as ProductType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Input
              type="number"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="Price (in Rupiah)"
              min="0"
              required
            />
          </div>
          {formData.type === 'service' && (
            <div className="grid gap-2">
              <Input
                type="number"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                placeholder="Duration (in minutes)"
                min="0"
                required
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">
            {editingProduct ? 'Update' : 'Add'} {formData.type === 'product' ? 'Product' : 'Service'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

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
                    updateMutation.mutate({ ...editingProduct, ...data });
                  } else {
                    addMutation.mutate(data);
                  }
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price (Rp)</TableHead>
              <TableHead>Duration (min)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="capitalize">{product.type}</TableCell>
                <TableCell>{product.price.toLocaleString('id-ID')}</TableCell>
                <TableCell>{product.type === 'service' ? product.duration : '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductManagement;
