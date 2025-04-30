
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Patient } from '@/types';
import { toast } from "sonner";
import PatientSelector from '../PatientSelector';
import PaymentReceipt from '../PaymentReceipt';
import { CartItem } from '@/types/pos';
import { saveTherapySession } from '@/services/therapySessionService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      change: 0,
      discount: 0,
      tax: 0, // Default tax rate of 0%
      loyaltyPoints: 0
    });
    
    // Expose the handleProcessPayment method via ref
    useImperativeHandle(ref, () => ({
      handleProcessPayment: (paymentAmount: number, changeAmount: number) => {
        // Calculate loyalty points (1 point per 10000 Rp spent)
        const earnedPoints = Math.floor(total / 10000);
        
        // Store payment information
        setPaymentDetails({
          amount: paymentAmount,
          change: changeAmount,
          discount: 0, // Default no discount
          tax: 0, // Default no tax
          loyaltyPoints: earnedPoints
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

    const handleCloseReceipt = async () => {
      try {
        // Save transaction to Firestore
        const subtotalAfterDiscount = total - paymentDetails.discount;
        const taxAmount = subtotalAfterDiscount * (paymentDetails.tax / 100);
        const finalTotal = subtotalAfterDiscount + taxAmount;
        
        if (!selectedPatient) {
          throw new Error("No patient selected");
        }
        
        // Save the transaction to Firestore
        const transactionData = {
          patientId: selectedPatient.id,
          patientName: selectedPatient.nama,
          date: serverTimestamp(),
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            isPackage: item.isPackage || false,
            type: item.type
          })),
          total: finalTotal,
          originalTotal: total,
          discount: paymentDetails.discount,
          tax: paymentDetails.tax,
          taxAmount: taxAmount,
          paymentAmount: paymentDetails.amount,
          changeAmount: paymentDetails.change,
          loyaltyPoints: paymentDetails.loyaltyPoints,
          paymentMethod: 'cash'
        };
        
        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        const transactionId = docRef.id;
        
        // Save therapy sessions for service items
        const therapyItems = items.filter(item => 
          item.type === 'service' && item.appointments && item.therapist
        );
        
        for (const item of therapyItems) {
          if (item.appointments && item.therapist) {
            if (item.isPackage) {
              // For package items, create multiple therapy sessions
              for (let i = 0; i < item.appointments.length; i++) {
                await saveTherapySession(
                  selectedPatient, 
                  item.therapist, 
                  item.id.split('-')[0], // Extract original product ID
                  item.name.split('(')[0].trim(), // Extract original product name
                  item.appointments[i],
                  true,
                  i,
                  transactionId
                );
              }
            } else {
              // For single visit items
              await saveTherapySession(
                selectedPatient,
                item.therapist,
                item.id.split('-')[0], // Extract original product ID
                item.name.split('(')[0].trim(), // Extract original product name
                item.appointments[0],
                false,
                0,
                transactionId
              );
            }
          }
        }
        
        toast.success("Transaction saved successfully");
      } catch (error) {
        console.error("Error saving transaction:", error);
        toast.error("Failed to save transaction");
      } finally {
        // Close receipt and reset state
        setReceiptOpen(false);
        setSelectedPatient(null);
        clearCart();
        setPaymentDetails({ amount: 0, change: 0, discount: 0, tax: 0, loyaltyPoints: 0 });
      }
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
          discount={paymentDetails.discount}
          tax={paymentDetails.tax}
          loyaltyPoints={paymentDetails.loyaltyPoints}
        />
      </>
    );
  }
);

PaymentProcessor.displayName = 'PaymentProcessor';

export default PaymentProcessor;
