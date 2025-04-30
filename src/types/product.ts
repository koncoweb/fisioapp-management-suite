
export type ProductType = 'product' | 'service';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  description?: string; // Added as optional to maintain backward compatibility
  duration?: number; // Only for services
  createdAt: string;
  updatedAt: string;
}
