
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CartItem } from '@/types/pos';
import { format } from 'date-fns';
import { Patient } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from "sonner";

// Receipt components
import ReceiptHeader from './receipt/ReceiptHeader';
import ClinicInfo from './receipt/ClinicInfo';
import ReceiptInfo from './receipt/ReceiptInfo';
import ServiceDetails from './receipt/ServiceDetails';
import PaymentDetails from './receipt/PaymentDetails';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessAnimation from './receipt/SuccessAnimation';
import ReceiptQRCode from './receipt/ReceiptQRCode';
import LoyaltyInfo from './receipt/LoyaltyInfo';

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  patient?: Patient | null;
  paymentAmount?: number;
  changeAmount?: number;
  discount?: number;
  tax?: number;
  loyaltyPoints?: number;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  items,
  total,
  patient,
  paymentAmount = 0,
  changeAmount = 0,
  discount = 0,
  tax = 0,
  loyaltyPoints = 0
}) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const receiptNo = `INV-${format(today, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`;
  
  // Calculate tax amount
  const subtotalAfterDiscount = total - discount;
  const taxAmount = subtotalAfterDiscount * (tax / 100);
  
  // Calculate final total after discount and tax
  const finalTotal = subtotalAfterDiscount + taxAmount;
  
  const handleCompletePayment = async () => {
    try {
      setIsSaving(true);
      
      // Memastikan data pasien ada sebelum menyimpan transaksi
      if (!patient) {
        toast.error("Data pasien diperlukan untuk menyimpan transaksi");
        setIsSaving(false);
        return;
      }
      
      // Persiapkan data untuk disimpan ke Firestore
      const transactionData = {
        receiptNo,
        transactionDate: new Date(), // Using regular Date instead of serverTimestamp
        patientId: patient?.id || null,
        patientName: patient?.nama || 'Guest',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          type: item.type,
          // Always include therapist information if available
          therapistId: item.therapist?.id || null,
          therapistName: item.therapist?.name || null,
          // Handle appointments safely by converting to plain objects
          appointments: item.appointments ? 
            item.appointments.map(a => ({
              date: format(a.date, 'yyyy-MM-dd'),
              time: a.time
            })) : null,
          // Include duration if available
          duration: item.duration || null
        })),
        total: finalTotal,
        originalTotal: total,
        discount,
        tax,
        taxAmount,
        paymentAmount,
        changeAmount,
        loyaltyPoints,
        createdAt: new Date() // Using regular Date instead of serverTimestamp
      };
      
      // Simpan transaksi ke koleksi 'transactions' di Firestore
      const docRef = await addDoc(collection(db, "transactions"), transactionData);
      console.log("Transaction saved with ID:", docRef.id);
      
      // Tampilkan animasi sukses dan notifikasi
      setPaymentCompleted(true);
      toast.success("Pembayaran berhasil disimpan");
      
      // Tampilkan dialog print setelah beberapa saat
      setTimeout(() => {
        if (receiptRef.current) {
          window.print();
        }
      }, 500);
      
      // Tutup dialog setelah berhasil
      setTimeout(() => {
        setPaymentCompleted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[400px] p-3 print:shadow-none print:border-none print:p-0">
        {paymentCompleted ? (
          <SuccessAnimation />
        ) : (
          <>
            <ReceiptHeader />
            
            <div className="space-y-3" ref={receiptRef}>
              <ClinicInfo />
              
              <ReceiptInfo 
                receiptNo={receiptNo}
                transactionDate={today}
                patient={patient}
              />
              
              <Separator className="my-1" />
              
              <ServiceDetails items={items} />
              
              <Separator className="my-1" />
              
              <PaymentDetails 
                total={total}
                discount={discount}
                tax={tax}
                finalTotal={finalTotal}
                paymentAmount={paymentAmount}
                changeAmount={changeAmount}
              />

              <LoyaltyInfo
                points={loyaltyPoints}
                patientName={patient?.nama}
              />
              
              <ReceiptQRCode 
                receiptNo={receiptNo}
                total={finalTotal}
                date={format(today, 'yyyy-MM-dd')}
              />
            </div>
            
            <ReceiptActions 
              isSaving={isSaving}
              onComplete={handleCompletePayment}
              onCancel={onClose}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;
