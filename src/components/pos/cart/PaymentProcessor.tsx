
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Patient } from '@/types';
import { toast } from "sonner";
import PatientSelector from '../PatientSelector';
import PaymentReceipt from '../PaymentReceipt';
import { CartItem } from '@/types/pos';
import { saveTherapySession } from '@/services/therapySessionService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PaymentProcessorProps {
  items: CartItem[];
  total: number;
  clearCart: () => void;
}

export interface PaymentProcessorHandle {
  handleProcessPayment: (paymentAmount: number, changeAmount: number, discount: number, tax: number) => void;
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
      tax: 5,
      loyaltyPoints: 0
    });
    
    // Expose the handleProcessPayment method via ref
    useImperativeHandle(ref, () => ({
      handleProcessPayment: (paymentAmount: number, changeAmount: number, discount: number, tax: number) => {
        // Calculate loyalty points (1 point per 10000 Rp spent)
        const earnedPoints = Math.floor(total / 10000);
        
        // Store payment information
        setPaymentDetails({
          amount: paymentAmount,
          change: changeAmount,
          discount: discount,
          tax: tax,
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
        // Hanya mencoba menyimpan terapi jika sudah ada data pasien
        if (!selectedPatient || !selectedPatient.id) {
          throw new Error("Tidak ada data pasien yang dipilih");
        }
        
        // Simpan sesi terapi untuk item layanan
        const therapyItems = items.filter(item => 
          item.type === 'service' && item.appointments && item.therapist
        );
        
        // Process all therapy items and save the sessions
        if (therapyItems.length > 0) {
          for (const item of therapyItems) {
            if (item.appointments && item.therapist) {
              try {
                if (item.isPackage) {
                  // Untuk item paket, buat beberapa sesi terapi
                  for (let i = 0; i < item.appointments.length; i++) {
                    await saveTherapySession(
                      selectedPatient, 
                      item.therapist, 
                      item.id.split('-')[0], // Extract original product ID
                      item.name.split('(')[0].trim(), // Extract original product name
                      item.appointments[i],
                      true,
                      i, // Pass the package index
                      null, // Pass null explicitly instead of undefined
                      item.duration // Pass the duration from the product
                    );
                  }
                } else {
                  // Untuk kunjungan tunggal
                  await saveTherapySession(
                    selectedPatient,
                    item.therapist,
                    item.id.split('-')[0], // Extract original product ID
                    item.name.split('(')[0].trim(), // Extract original product name
                    item.appointments[0],
                    false,
                    0, // Non-package sessions get index 0
                    null, // Pass null explicitly instead of undefined
                    item.duration // Pass the duration from the product
                  );
                }
              } catch (error) {
                console.error("Error saving therapy session:", error);
                toast.error(`Gagal menyimpan jadwal terapi: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          }
        }
        
        toast.success("Transaksi berhasil disimpan");
      } catch (error) {
        console.error("Error handling receipt close:", error);
        toast.error(`Gagal menyelesaikan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // Close receipt and reset state
        setReceiptOpen(false);
        setSelectedPatient(null);
        clearCart();
        setPaymentDetails({ amount: 0, change: 0, discount: 0, tax: 5, loyaltyPoints: 0 });
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
