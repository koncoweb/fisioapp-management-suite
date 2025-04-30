
import { Product } from '@/types/product';

export interface AppointmentSlot {
  date: Date;
  time: string;
}

export interface CartItem extends Product {
  quantity: number;
  isPackage?: boolean;
  appointments?: AppointmentSlot[];
  appointmentDate?: Date;  // Kept for backward compatibility
  appointmentTime?: string; // Kept for backward compatibility
}
