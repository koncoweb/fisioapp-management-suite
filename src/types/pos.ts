
import { Employee } from '.';
import { Product } from './product';

export interface AppointmentSlot {
  date: Date;
  time: string;
}

export interface CartItemBase extends Product {
  quantity: number;
  isPackage?: boolean;
}

export interface CartItem extends CartItemBase {
  appointmentDate?: Date; // For backward compatibility
  appointmentTime?: string; // For backward compatibility
  appointments?: AppointmentSlot[];
  therapist?: Employee; // Added therapist field
}
