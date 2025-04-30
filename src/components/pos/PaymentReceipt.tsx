
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartItem } from '@/pages/admin/PointOfSale';
import { formatISO, format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

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

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  patient?: Patient | null;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  items,
  total,
  patient
}) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const today = new Date();
  const receiptNo = `INV-${format(today, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`;
  
  const handleCompletePayment = () => {
    // Here you would normally process the payment
    // For now, we'll just show a success animation
    setPaymentCompleted(true);
    
    // After 2 seconds, close the dialog and reset
    setTimeout(() => {
      setPaymentCompleted(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        {paymentCompleted ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold">Pembayaran Berhasil</h2>
            <p className="text-muted-foreground mt-2">Terima kasih telah berbelanja</p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">Struk Pembayaran</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Klinik Therapy & Relaxation</p>
                <p>Jl. Kesehatan No. 123</p>
                <p>Jakarta, Indonesia</p>
              </div>
              
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span>{receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{format(today, 'dd/MM/yyyy HH:mm')}</span>
                </div>
                
                {patient && (
                  <>
                    <Separator className="my-2" />
                    <div className="mb-1 font-medium">Data Pasien:</div>
                    <div className="text-xs space-y-1 bg-secondary/20 p-2 rounded-md">
                      <div><span className="font-medium">Nama:</span> {patient.nama}</div>
                      <div><span className="font-medium">Alamat:</span> {patient.alamat}</div>
                      <div><span className="font-medium">Usia:</span> {patient.usia} tahun</div>
                      {patient.telepon && <div><span className="font-medium">Telepon:</span> {patient.telepon}</div>}
                      <div><span className="font-medium">Keluhan:</span> {patient.keluhan}</div>
                    </div>
                  </>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Detail Layanan:</h3>
                <ul className="space-y-1.5 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <div>
                        <span>{item.name}</span>
                        <span className="text-xs text-muted-foreground"> x{item.quantity}</span>
                      </div>
                      <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                className="w-full" 
                onClick={handleCompletePayment}
              >
                Selesaikan Pembayaran
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
              >
                Batal
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;
