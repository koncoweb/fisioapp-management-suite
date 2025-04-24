
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types/product';
import { useToast } from "@/components/ui/use-toast";

export const useProductMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  return {
    addMutation,
    updateMutation,
    deleteMutation,
  };
};
