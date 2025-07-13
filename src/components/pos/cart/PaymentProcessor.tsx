
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from "sonner";
import PaymentReceipt from '../PaymentReceipt';
import { CartItem } from '@/types/pos';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types';
import PatientSearch from '../patient/PatientSearch';

interface PaymentProcessorProps {
  items: CartItem[];
  total: number;
  clearCart: () => void;
}

export interface PaymentProcessorHandle {
  handleProcessPayment: (paymentAmount: number, changeAmount: number) => void;
}

// Predefined categories for transactions
const TRANSACTION_CATEGORIES = [
  'Penjualan Produk',
  'Layanan Terapi'
];

// Predefined payment methods
const PAYMENT_METHODS = [
  'Tunai',
  'QRIS',
  'Bank Transfer',
  'Kartu Debit',
  'Kartu Kredit',
  'E-Money',
  'Transfer Bank',
  'Virtual Account',
  'DANA',
  'OVO',
  'GoPay',
  'ShopeePay',
  'LinkAja',
  'BCA Mobile',
  'Mandiri Online',
  'BNI Mobile',
  'BRI Mobile'
];

const PaymentProcessor = forwardRef<PaymentProcessorHandle, PaymentProcessorProps>(
  ({ items, total, clearCart }, ref) => {
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
      amount: 0,
      change: 0
    });
    const [transactionCategory, setTransactionCategory] = useState('');
    const [transactionNote, setTransactionNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    
    // Expose the handleProcessPayment method via ref
    useImperativeHandle(ref, () => ({
      handleProcessPayment: (paymentAmount: number, changeAmount: number) => {
        // Store payment information
        setPaymentDetails({
          amount: paymentAmount,
          change: changeAmount
        });
        
        // Open category selection dialog first
        setCategoryDialogOpen(true);
      }
    }));

    // Handle category selection and proceed to receipt
    const handleCategorySelected = () => {
      // Use custom category if selected, otherwise use the selected predefined category
      const finalCategory = transactionCategory;
      
      // Close category dialog and open receipt
      setCategoryDialogOpen(false);
      setReceiptOpen(true);
    };
    
    // Handle category dialog close without selection
    const handleCategoryDialogClose = () => {
      setCategoryDialogOpen(false);
      // Default to 'Lain-lain' category if none selected
      if (!transactionCategory) {
        setTransactionCategory('Lain-lain');
      }
      setReceiptOpen(true);
    };

    const handleCloseReceipt = async () => {
      try {
        // Simpan transaksi tanpa data pasien
        const transactionItems = items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          type: item.type
        }));
        
        // Simpan transaksi ke Firestore
        const transactionData = {
          items: transactionItems,
          total: total,
          paymentAmount: paymentDetails.amount,
          changeAmount: paymentDetails.change,
          date: new Date(),
          createdAt: new Date(),
          // Tambahkan kategori, metode pembayaran dan catatan transaksi
          category: transactionCategory || 'Lain-lain',
          paymentMethod: paymentMethod || 'Tunai',
          note: transactionNote || '',
          receiptNo: `POS-${new Date().getTime()}`,
          customerId: selectedPatient?.id,
          customerNama: selectedPatient?.nama,
          customerTelepon: selectedPatient?.telepon,
          customerEmail: selectedPatient?.email,
          customerAlamat: selectedPatient?.alamat
        };
        
        await addDoc(collection(db, "transactions"), transactionData);
        toast.success("Transaksi berhasil disimpan");
      } catch (error) {
        console.error("Error handling receipt close:", error);
        toast.error(`Gagal menyelesaikan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        // Close receipt and reset state
        setReceiptOpen(false);
        clearCart();
        setPaymentDetails({ amount: 0, change: 0 });
        setTransactionCategory('');
        setTransactionNote('');
        setPaymentMethod('Tunai');
        setSelectedPatient(null); // Reset selected patient
      }
    };

    return (
      <>
        {/* Category Selection Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={handleCategoryDialogClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Pilih Kustomer & Kategori Transaksi</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Pencarian Customer */}
              <div className="grid gap-2">
                <Label htmlFor="customer">Cari Customer</Label>
                {!selectedPatient ? (
                  <PatientSearch onSelectPatient={setSelectedPatient} />
                ) : (
                  <div className="p-2 border rounded flex items-center justify-between bg-muted/30">
                    <div>
                      <div className="font-medium">{selectedPatient.nama}</div>
                      <div className="text-xs text-muted-foreground">{selectedPatient.alamat} | {selectedPatient.telepon || '-'} | {selectedPatient.email || '-'}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedPatient(null)}>Ganti</Button>
                  </div>
                )}
              </div>
              {/* Pilihan Kategori & Metode Pembayaran */}
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={transactionCategory === category ? "default" : "outline"}
                      onClick={() => {
                        setTransactionCategory(category);
                      }}
                      className="justify-start"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="payment-method">Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {PAYMENT_METHODS.filter(method => method !== 'E-Wallet').map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => {
                        setPaymentMethod(method);
                      }}
                      className="justify-start text-xs"
                      size="sm"
                    >
                      {method}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="note">Catatan Transaksi</Label>
                <Input
                  id="note"
                  placeholder="Tambahkan catatan (opsional)"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCategorySelected} disabled={!selectedPatient}>Lanjutkan</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Payment Receipt */}
        <PaymentReceipt
          isOpen={receiptOpen}
          onClose={handleCloseReceipt}
          items={items}
          total={total}
          paymentAmount={paymentDetails.amount}
          changeAmount={paymentDetails.change}
          category={transactionCategory || 'Lain-lain'}
          paymentMethod={paymentMethod || 'Tunai'}
          note={transactionNote}
          customer={selectedPatient}
        />
      </>
    );
  }
);

PaymentProcessor.displayName = 'PaymentProcessor';

export default PaymentProcessor;
