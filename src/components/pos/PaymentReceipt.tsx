
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CartItem } from '@/types/pos';
import { format } from 'date-fns';
import { Patient } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from "sonner";

// Definisi tipe untuk item transaksi
interface TransactionItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: string;
  therapistId?: string | null;
  therapistName?: string;
  appointments?: Array<{ date: string; time: string }>;
  duration?: number;
  [key: string]: any; // Untuk properti tambahan lainnya
}

// Receipt components
import ReceiptHeader from './receipt/ReceiptHeader';
import ClinicInfo from './receipt/ClinicInfo';
import ReceiptInfo from './receipt/ReceiptInfo';
import ServiceDetails from './receipt/ServiceDetails';
import PaymentDetails from './receipt/PaymentDetails';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessAnimation from './receipt/SuccessAnimation';
// QR code dan loyalty point dihapus sesuai permintaan

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  patient?: Patient | null;
  paymentAmount?: number;
  changeAmount?: number;
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
  loyaltyPoints = 0
}) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const receiptNo = `INV-${format(today, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`;
  
  // Final total sama dengan total karena tidak ada diskon dan pajak
  const finalTotal = total;
  
  // Fungsi untuk mencetak receipt
  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('Popup diblokir oleh browser. Mohon izinkan popup untuk mencetak struk.');
          return;
        }
        
        printWindow.document.write(`
          <html>
            <head>
              <title>Struk Pembayaran</title>
              <style>
                @page {
                  size: ${printerSize} auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  scale: 1 !important;
                }
                html, body {
                  font-family: Arial, sans-serif !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: ${printerSize} !important;
                  background-color: white !important;
                  color: black !important;
                  max-width: ${printerSize} !important;
                  min-width: ${printerSize} !important;
                  height: auto !important;
                }
                .receipt-container {
                  width: ${printerSize} !important;
                  max-width: ${printerSize} !important;
                  min-width: ${printerSize} !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  overflow: visible !important;
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                }
                /* Memastikan header rata tengah */
                .DialogHeader, .DialogTitle, h1, h2, h3, h4 {
                  text-align: center !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                /* Memastikan paragraf dan span */
                p, span {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                /* Ukuran font yang sesuai */
                .text-xs, .text-sm, .text-[10px], .text-[9px] {
                  font-size: ${printerSize === '58mm' ? '8px' : '10px'} !important;
                  line-height: 1.2 !important;
                }
                .text-base {
                  font-size: ${printerSize === '58mm' ? '10px' : '12px'} !important;
                  line-height: 1.3 !important;
                }
                .text-lg, .text-xl {
                  font-size: ${printerSize === '58mm' ? '12px' : '14px'} !important;
                  line-height: 1.4 !important;
                }
                /* Memastikan gambar rata tengah */
                img {
                  display: block;
                  margin: 0 auto;
                  max-width: 90%;
                }
                /* Memastikan tabel dan data rata tengah */
                table, tr, td {
                  width: 100%;
                  text-align: center;
                }
                /* Memastikan border terlihat */
                .border, .border-t, .border-b {
                  border-color: black;
                }
                /* Memastikan flex items tetap terlihat baik */
                .flex {
                  display: flex !important;
                  justify-content: space-between !important;
                  width: 100% !important;
                  margin: 1px 0 !important;
                }
                /* Memastikan separator terlihat */
                .separator, .border-t, .border-b {
                  border-top: 1px solid black !important;
                  width: 100% !important;
                  margin: 2px 0 !important;
                  padding: 0 !important;
                }
                /* Mengurangi spacing */
                .space-y-1, .space-y-2, .space-y-3 {
                  margin-top: 1px !important;
                  margin-bottom: 1px !important;
                }
                .my-1, .my-2, .mt-1, .mt-2, .mb-1, .mb-2 {
                  margin-top: 1px !important;
                  margin-bottom: 1px !important;
                }
                .py-1, .py-2, .pt-1, .pt-2, .pb-1, .pb-2 {
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                }
                /* Mengatur tampilan tabel seperti pada gambar */
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                }
                tr, td {
                  padding: 0 !important;
                  margin: 0 !important;
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${receiptRef.current.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  // Mengubah semua separator menjadi garis horizontal
                  var separators = document.querySelectorAll('.my-1, .my-2, .border-t, .border-b');
                  for (var i = 0; i < separators.length; i++) {
                    separators[i].className = 'separator';
                  }
                  
                  // Mengatur semua flex items agar tetap terlihat baik
                  var flexItems = document.querySelectorAll('.flex');
                  for (var i = 0; i < flexItems.length; i++) {
                    var children = flexItems[i].children;
                    if (children.length === 2) {
                      children[0].style.textAlign = 'left';
                      children[1].style.textAlign = 'right';
                    }
                  }
                  
                  // Mengatur tampilan seperti pada gambar
                  document.body.style.width = '${printerSize}';
                  document.body.style.margin = '0';
                  document.body.style.padding = '0';
                  
                  // Mengatur container receipt
                  var receiptContainer = document.querySelector('.receipt-container');
                  if (receiptContainer) {
                    receiptContainer.style.width = '${printerSize}';
                    receiptContainer.style.margin = '0';
                    receiptContainer.style.padding = '0';
                    receiptContainer.style.position = 'absolute';
                    receiptContainer.style.top = '0';
                    receiptContainer.style.left = '0';
                  }
                  
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() {
                      window.close();
                    }, 100);
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
      } catch (error) {
        console.error('Error printing receipt:', error);
        toast.error('Gagal mencetak struk. Silakan coba lagi.');
      }
    } else {
      console.error('Receipt reference is null');
      toast.error('Gagal mencetak struk. Referensi struk tidak ditemukan.');
    }
  };

  const handleCompletePayment = async () => {
    try {
      setIsSaving(true);
      
      // Memastikan data pasien ada sebelum menyimpan transaksi
      if (!patient) {
        toast.error("Data pasien diperlukan untuk menyimpan transaksi");
        setIsSaving(false);
        return;
      }
      
      // Persiapkan data untuk disimpan ke Firestore - pastikan semua data valid
      const transactionData = {
        receiptNo,
        transactionDate: serverTimestamp(), // Gunakan serverTimestamp untuk konsistensi
        patientId: patient?.id || null,
        patientName: patient?.nama || 'Guest',
        items: items.map(item => {
          // Buat objek dasar dengan properti yang pasti valid
          const itemData: TransactionItemData = {
            id: item.id || '',
            name: item.name || '',
            price: typeof item.price === 'number' ? item.price : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            type: item.type || 'product'
          };
          
          // Tambahkan informasi terapis jika tersedia
          if (item.therapist) {
            itemData.therapistId = item.therapist.id || null;
            itemData.therapistName = item.therapist.name || item.therapist.email || 'Terapis';
          }
          
          // Tambahkan informasi appointment jika tersedia
          if (item.appointments && Array.isArray(item.appointments) && item.appointments.length > 0) {
            itemData.appointments = item.appointments.map(a => ({
              date: a.date instanceof Date ? format(a.date, 'yyyy-MM-dd') : '',
              time: a.time || ''
            })).filter(a => a.date && a.time); // Filter hanya appointment yang valid
          }
          
          // Tambahkan durasi jika tersedia
          if (typeof item.duration === 'number') {
            itemData.duration = item.duration;
          }
          
          return itemData;
        }),
        total: typeof finalTotal === 'number' ? finalTotal : 0,
        originalTotal: typeof total === 'number' ? total : 0,
        paymentAmount: typeof paymentAmount === 'number' ? paymentAmount : 0,
        changeAmount: typeof changeAmount === 'number' ? changeAmount : 0,
        createdAt: serverTimestamp() // Gunakan serverTimestamp untuk konsistensi
      };
      
      // Simpan transaksi ke koleksi 'transactions' di Firestore
      const docRef = await addDoc(collection(db, "transactions"), transactionData);
      console.log("Transaction saved with ID:", docRef.id);
      
      // Tampilkan animasi sukses dan notifikasi
      setPaymentCompleted(true);
      toast.success("Pembayaran berhasil disimpan");
      
      // Tutup dialog setelah beberapa saat jika pengguna tidak mencetak
      const closeTimer = setTimeout(() => {
        setPaymentCompleted(false);
        onClose();
      }, 10000); // Berikan waktu lebih lama (10 detik) bagi pengguna untuk mencetak
      
      // Bersihkan timer jika komponen di-unmount
      return () => clearTimeout(closeTimer);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // State untuk ukuran printer (80mm default, 58mm opsional)
  const [printerSize, setPrinterSize] = useState<'80mm' | '58mm'>('80mm');
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className={`sm:max-w-[350px] p-3 print:shadow-none print:border-none print:p-0 print:w-[${printerSize}] print:m-0`}>
        {!paymentCompleted && (
          <div className="mb-3 flex items-center justify-end space-x-2">
            <div className="text-xs text-muted-foreground">Ukuran Printer:</div>
            <select 
              value={printerSize} 
              onChange={(e) => setPrinterSize(e.target.value as '80mm' | '58mm')}
              className="text-xs p-1 border rounded"
            >
              <option value="80mm">80mm (Standar)</option>
              <option value="58mm">58mm (Portable)</option>
            </select>
          </div>
        )}
        
        {/* Konten receipt selalu ada di DOM tapi tersembunyi saat paymentCompleted true */}
        <div 
          className={`${paymentCompleted ? 'hidden print:block' : 'block'} ${printerSize === '58mm' ? 'receipt-58mm' : ''}`} 
          id="receipt-content" 
          ref={receiptRef} 
          style={{ pageBreakAfter: 'always' }}
        >
          <ReceiptHeader />
          <div className="space-y-2">
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
              finalTotal={finalTotal}
              paymentAmount={paymentAmount}
              changeAmount={changeAmount}
            />
            
            {/* Footer sederhana dengan informasi receipt */}
            <div className="text-center text-[10px] print:text-xs mt-2 pt-1 border-t">
              <p className="font-medium">TERIMA KASIH</p>
              <p className="text-[9px] print:text-[10px]">Atas Kunjungan Anda</p>
              <p className="text-[9px] print:text-[10px] text-muted-foreground">{receiptNo}</p>
              <p className="text-[9px] print:text-[10px] text-muted-foreground">{format(today, 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
        
        {/* Tampilkan UI berdasarkan status */}
        {paymentCompleted ? (
          <SuccessAnimation onPrint={handlePrintReceipt} />
        ) : (
          <ReceiptActions 
            isSaving={isSaving}
            onComplete={handleCompletePayment}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;
