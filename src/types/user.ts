export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'therapist' | 'patient';
  phone?: string;
  address?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  specialization?: string; // untuk terapis
  notes?: string;
}
