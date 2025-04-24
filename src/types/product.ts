
export type ProductType = 'product' | 'service';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  duration?: number; // Only for services
  createdAt: string;
  updatedAt: string;
}
