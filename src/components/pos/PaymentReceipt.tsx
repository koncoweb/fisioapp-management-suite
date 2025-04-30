
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppointmentSlot, CartItem } from '@/types/pos';
import { formatISO, format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Wallet } from 'lucide-react';
import { Patient } from '@/types';
import { formatRupiah } from '@/lib/utils';

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  patient?: Patient | null;
  paymentAmount?: number;
  changeAmount?: number;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  items,
  total,
  patient,
  paymentAmount = 0,
  changeAmount = 0
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
      <DialogContent className="sm:max-w-[400px] p-3">
        {paymentCompleted ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
            <h2 className="text-lg font-semibold">Pembayaran Berhasil</h2>
            <p className="text-xs text-muted-foreground mt-1">Terima kasih telah berbelanja</p>
          </motion.div>
        ) : (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle className="text-center text-base">Struk Pembayaran</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="text-center text-xs text-muted-foreground">
                <p>Klinik Therapy & Relaxation</p>
                <p>Jl. Kesehatan No. 123</p>
                <p>Jakarta, Indonesia</p>
              </div>
              
              <div className="text-xs">
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
                    <Separator className="my-1.5" />
                    <div className="mb-0.5 font-medium text-xs">Data Pasien:</div>
                    <div className="text-[10px] space-y-0.5 bg-secondary/20 p-1.5 rounded-md">
                      <div><span className="font-medium">Nama:</span> {patient.nama}</div>
                      <div><span className="font-medium">Alamat:</span> {patient.alamat}</div>
                      <div><span className="font-medium">Usia:</span> {patient.usia} tahun</div>
                      {patient.telepon && <div><span className="font-medium">Telepon:</span> {patient.telepon}</div>}
                      <div><span className="font-medium">Keluhan:</span> {patient.keluhan}</div>
                    </div>
                  </>
                )}
              </div>
              
              <Separator className="my-1" />
              
              <div>
                <h3 className="font-medium mb-1 text-xs">Detail Layanan:</h3>
                <ul className="space-y-1 text-[10px]">
                  {items.map((item) => (
                    <li key={item.id} className="flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <span>{item.name}</span>
                          <span className="text-[9px] text-muted-foreground"> x{item.quantity}</span>
                        </div>
                        <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                      
                      {/* Display appointment details for packages with multiple appointments */}
                      {item.appointments && item.appointments.length > 0 && item.type === 'service' && (
                        <div className="ml-2 mt-0.5 space-y-1">
                          {item.isPackage ? (
                            // For package with multiple appointments
                            item.appointments.map((appointment, idx) => (
                              <div key={idx} className="flex items-center text-[9px] text-muted-foreground">
                                <span className="mr-1 font-semibold">Visit {idx + 1}:</span>
                                <Calendar className="h-2.5 w-2.5 mr-0.5" />
                                <span className="mr-1">{format(appointment.date, "dd MMM yyyy")}</span>
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                <span>{appointment.time}</span>
                              </div>
                            ))
                          ) : (
                            // For single appointment (backward compatibility)
                            <div className="flex items-center text-[9px] text-muted-foreground">
                              <Calendar className="h-2.5 w-2.5 mr-0.5" />
                              <span className="mr-1">
                                {format(item.appointments[0].date, "dd MMM yyyy")}
                              </span>
                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                              <span>{item.appointments[0].time}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Legacy support for old appointmentDate format */}
                      {!item.appointments && item.appointmentDate && item.appointmentTime && item.type === 'service' && (
                        <div className="flex items-center text-[9px] text-muted-foreground mt-0.5 ml-2">
                          <Calendar className="h-2.5 w-2.5 mr-0.5" />
                          <span className="mr-1">{format(item.appointmentDate, "dd MMM yyyy")}</span>
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          <span>{item.appointmentTime}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator className="my-1" />
              
              {/* Payment details section */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>{formatRupiah(total)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Wallet className="h-3 w-3 mr-1 text-muted-foreground" /> 
                    <span>Tunai</span>
                  </div>
                  <span>{formatRupiah(paymentAmount)}</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Kembalian</span>
                  <span>{formatRupiah(changeAmount)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col gap-1.5 sm:flex-col pt-2">
              <Button 
                className="w-full h-7 text-xs" 
                onClick={handleCompletePayment}
              >
                Selesaikan Pembayaran
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-7 text-xs" 
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
