
import React, { useState } from 'react';
import { CartItem } from '@/pages/admin/PointOfSale';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import PaymentReceipt from './PaymentReceipt';
import PatientSelector from './PatientSelector';
import { Patient } from '@/types';
import { toast } from "sonner";

interface ShoppingCartProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
}

interface Patient {
  id: string;
  nama: string;
  alamat: string;
  usia: number;
  keluhan?: string;
  telepon?: string;
  email?: string;
  riwayatMedis?: string;
  createdAt: any;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  items, 
  updateQuantity, 
  removeItem, 
  clearCart,
  total
}) => {
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [patientSelectorOpen, setPatientSelectorOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity)) {
      updateQuantity(id, quantity);
    }
  };

  const handleProcessPayment = () => {
    // First open patient selector
    setPatientSelectorOpen(true);
  };

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSelectorOpen(false);
    toast.success(`Pasien "${patient.nama}" terpilih`);
    // After selecting patient, open the receipt
    setReceiptOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptOpen(false);
    setSelectedPatient(null);
    clearCart();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto max-h-[400px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
            <CartIcon className="h-8 w-8 mb-1 opacity-20" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-xs truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease</span>
                    </Button>
                    <Input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="h-6 w-8 text-center border-0 p-0 text-xs"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-3">
          <Separator className="my-2" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Total</span>
            <span className="text-base font-bold">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleProcessPayment}
              className="w-full text-sm h-8"
            >
              Process Payment
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={clearCart} 
              className="w-full text-sm h-8"
            >
              Clear Cart
            </Button>
          </div>
        </div>
      )}

      {/* Patient Selector Modal */}
      <PatientSelector
        isOpen={patientSelectorOpen}
        onClose={() => setPatientSelectorOpen(false)}
        onSelectPatient={handlePatientSelected}
      />

      {/* Payment Receipt (now includes selected patient) */}
      <PaymentReceipt
        isOpen={receiptOpen}
        onClose={handleCloseReceipt}
        items={items}
        total={total}
        patient={selectedPatient}
      />
    </div>
  );
};

export default ShoppingCart;
