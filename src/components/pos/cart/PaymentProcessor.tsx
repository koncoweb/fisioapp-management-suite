
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Patient } from '@/types';
import { toast } from "sonner";
import PatientSelector from '../PatientSelector';
import PaymentReceipt from '../PaymentReceipt';
import { CartItem } from '@/types/pos';

interface PaymentProcessorProps {
  items: CartItem[];
  total: number;
  clearCart: () => void;
}

export interface PaymentProcessorHandle {
  handleProcessPayment: (paymentAmount: number, changeAmount: number) => void;
}

const PaymentProcessor = forwardRef<PaymentProcessorHandle, PaymentProcessorProps>(
  ({ items, total, clearCart }, ref) => {
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [patientSelectorOpen, setPatientSelectorOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isProcessingPatient, setIsProcessingPatient] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
      amount: 0,
      change: 0
    });
    
    // Expose the handleProcessPayment method via ref
    useImperativeHandle(ref, () => ({
      handleProcessPayment: (paymentAmount: number, changeAmount: number) => {
        // Store payment information
        setPaymentDetails({
          amount: paymentAmount,
          change: changeAmount
        });
        
        // First open patient selector
        setPatientSelectorOpen(true);
      }
    }));

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
      setPaymentDetails({ amount: 0, change: 0 });
    };

    return (
      <>
        {/* Patient Selector Modal */}
        <PatientSelector
          isOpen={patientSelectorOpen}
          onClose={() => setPatientSelectorOpen(false)}
          onSelectPatient={handlePatientSelected}
        />

        {/* Payment Receipt (includes selected patient and payment details) */}
        <PaymentReceipt
          isOpen={receiptOpen}
          onClose={handleCloseReceipt}
          items={items}
          total={total}
          patient={selectedPatient}
          paymentAmount={paymentDetails.amount}
          changeAmount={paymentDetails.change}
        />
      </>
    );
  }
);

PaymentProcessor.displayName = 'PaymentProcessor';

export default PaymentProcessor;
