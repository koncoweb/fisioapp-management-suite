
import React, { useState } from 'react';
import { CartItem } from '@/types/pos';
import { Card, CardContent } from "@/components/ui/card";
import { Patient } from '@/types';
import { toast } from "sonner";
import CartHeader from './cart/CartHeader';
import CartItemList from './cart/CartItemList';
import CartFooter from './cart/CartFooter';
import PaymentReceipt from './PaymentReceipt';
import PatientSelector from './PatientSelector';

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
  const [isProcessingPatient, setIsProcessingPatient] = useState(false);
  
  const handleProcessPayment = () => {
    // First open patient selector
    setPatientSelectorOpen(true);
  };

  const handlePatientSelected = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSelectorOpen(false);
    
    // Set processing state to true (useful for newly created patients)
    setIsProcessingPatient(true);
    
    // Verify patient exists in Firestore by checking for ID
    if (patient.id) {
      toast.success(`Pasien "${patient.nama}" terpilih`);
      // After selecting patient, open the receipt with a small delay 
      // to ensure Firestore transaction is complete
      setTimeout(() => {
        setIsProcessingPatient(false);
        setReceiptOpen(true);
      }, 500);
    } else {
      toast.error("Data pasien tidak lengkap, mohon coba lagi");
      setIsProcessingPatient(false);
    }
  };

  const handleCloseReceipt = () => {
    setReceiptOpen(false);
    setSelectedPatient(null);
    clearCart();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto max-h-[400px]">
        <CartItemList 
          items={items} 
          updateQuantity={updateQuantity} 
          removeItem={removeItem} 
        />
      </div>

      <CartFooter
        total={total}
        hasItems={items.length > 0}
        onProcessPayment={handleProcessPayment}
        onClearCart={clearCart}
        isProcessing={isProcessingPatient}
      />

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
