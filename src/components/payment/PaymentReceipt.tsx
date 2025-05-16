import React, { useRef } from 'react';
import { TherapyPayment } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PaymentReceiptProps {
  payment: TherapyPayment;
  onClose: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ payment, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const handlePrint = () => {
    if (!receiptRef.current) return;
    
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printStyles = `
      @page {
        size: 80mm 200mm;
        margin: 5mm;
      }
      body {
        margin: 0;
        padding: 0;
        color: black;
        font-size: 12pt;
      }
      h2, h3 {
        color: black;
        font-weight: bold;
      }
      .receipt-container {
        width: 80mm;
        padding: 5mm;
      }
    `;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt-${payment.receiptNumber || payment.id}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Delay printing to ensure content is fully loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200],
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 80, 0);
    pdf.save(`Receipt-${payment.receiptNumber || payment.id}.pdf`);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div 
        ref={receiptRef} 
        className="bg-white p-4 border rounded-md shadow-sm"
        style={{ width: '80mm', margin: '0 auto', color: 'black' }}
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-black">Fisioapp Clinic</h2>
          <p className="text-sm text-black">Jl. Contoh No. 123, Jakarta</p>
          <p className="text-sm text-black">Telp: (021) 1234-5678</p>
          <div className="border-t border-dashed my-2 border-black"></div>
          <h3 className="font-bold text-lg text-black">BUKTI PEMBAYARAN</h3>
          <p className="text-sm text-black font-medium">No: {payment.receiptNumber || payment.id.substring(0, 8)}</p>
          <p className="text-sm text-black">Tanggal: {format(new Date(payment.paymentDate || payment.createdAt), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        
        <div className="text-base mb-4 text-black">
          <div className="flex justify-between mb-1">
            <span className="font-medium">Pasien:</span>
            <span>{payment.patientName}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Terapis:</span>
            <span>{payment.therapistName}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Layanan:</span>
            <span>{payment.serviceName}</span>
          </div>
        </div>
        
        <div className="border-t border-dashed my-2 border-black"></div>
        
        <div className="text-base mb-4 text-black">
          <div className="flex justify-between font-bold mb-1">
            <span>Total:</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Metode Pembayaran:</span>
            <span>{payment.paymentMethod === 'cash' ? 'Tunai' :
                   payment.paymentMethod === 'transfer' ? 'Transfer Bank' :
                   payment.paymentMethod === 'debit' ? 'Kartu Debit' :
                   payment.paymentMethod === 'credit' ? 'Kartu Kredit' :
                   payment.paymentMethod === 'qris' ? 'QRIS' : payment.paymentMethod}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Status:</span>
            <span className="font-bold text-green-600">LUNAS</span>
          </div>
        </div>
        
        {payment.notes && (
          <div className="text-sm mb-4 text-black">
            <p className="font-bold">Catatan:</p>
            <p>{payment.notes}</p>
          </div>
        )}
        
        <div className="border-t border-dashed my-2 border-black"></div>
        
        <div className="text-center text-sm text-black">
          <p className="font-medium">Terima kasih atas kunjungan Anda</p>
          <p>Semoga lekas sembuh</p>
        </div>
      </div>
      
      <div className="flex justify-center space-x-3">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1" />
          Cetak
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-1" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  );
};

export default PaymentReceipt;
