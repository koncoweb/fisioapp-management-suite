
import React, { useState } from 'react';
import { CartItem } from '@/types/pos';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon, Calendar, Clock } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import PaymentReceipt from './PaymentReceipt';
import PatientSelector from './PatientSelector';
import { Patient } from '@/types';
import { toast } from "sonner";
import { format } from "date-fns";

interface ShoppingCartProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
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
          <div className="flex flex-col items-center justify-center py-3 text-center text-muted-foreground">
            <CartIcon className="h-6 w-6 mb-1 opacity-20" />
            <p className="text-xs">Your cart is empty</p>
          </div>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-1.5 rounded-md">
                <div className="flex-grow min-w-0 pr-1">
                  <h4 className="font-medium text-[10px] truncate">{item.name}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Rp {item.price.toLocaleString('id-ID')} x {item.quantity}
                  </p>
                  
                  {/* Show appointment details if available */}
                  {item.appointmentDate && item.appointmentTime && (
                    <div className="flex items-center mt-0.5 text-[9px] text-muted-foreground">
                      <Calendar className="h-2 w-2 mr-0.5" />
                      <span className="mr-1">{format(item.appointmentDate, "dd MMM")}</span>
                      <Clock className="h-2 w-2 mr-0.5" />
                      <span>{item.appointmentTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-2.5 w-2.5" />
                      <span className="sr-only">Decrease</span>
                    </Button>
                    <Input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="h-5 w-6 text-center border-0 p-0 text-[10px]"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span className="sr-only">Increase</span>
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-2">
          <Separator className="my-1.5" />
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-semibold text-xs">Total</span>
            <span className="text-sm font-bold">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button 
              variant="default" 
              size="sm"
              onClick={handleProcessPayment}
              className="w-full text-xs h-7"
            >
              Process Payment
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={clearCart} 
              className="w-full text-xs h-7"
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
