
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductType } from '@/types/product';

interface ProductFormProps {
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'product' as ProductType,
    price: initialData?.price || 0,
    duration: initialData?.duration || 0,
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
          {initialData ? 'Update' : 'Add'} {formData.type === 'product' ? 'Product' : 'Service'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
